/**
 * Gmail Inbox Scanner for SnipKitty
 *
 * Uses the Gmail API to search for subscription-related emails,
 * then extracts subscription info (name, amount, billing cycle).
 */

const GMAIL_API = 'https://www.googleapis.com/gmail/v1/users/me'

// Search queries to find subscription emails
const SEARCH_QUERIES = [
  'subject:(subscription OR receipt OR billing OR invoice OR renewal OR payment confirmation) newer_than:12m',
  'from:(noreply OR billing OR receipt OR invoice OR payments OR subscriptions) newer_than:12m subject:(charge OR payment OR receipt)',
]

// Known subscription services and their categories
const KNOWN_SERVICES = {
  'netflix': { name: 'Netflix', category: 'entertainment' },
  'spotify': { name: 'Spotify', category: 'music' },
  'apple': { name: 'Apple', category: 'entertainment' },
  'disney': { name: 'Disney+', category: 'entertainment' },
  'hulu': { name: 'Hulu', category: 'entertainment' },
  'youtube': { name: 'YouTube Premium', category: 'entertainment' },
  'amazon prime': { name: 'Amazon Prime', category: 'entertainment' },
  'hbo': { name: 'HBO Max', category: 'entertainment' },
  'adobe': { name: 'Adobe', category: 'productivity' },
  'microsoft': { name: 'Microsoft 365', category: 'productivity' },
  'notion': { name: 'Notion', category: 'productivity' },
  'slack': { name: 'Slack', category: 'productivity' },
  'zoom': { name: 'Zoom', category: 'productivity' },
  'canva': { name: 'Canva', category: 'productivity' },
  'figma': { name: 'Figma', category: 'developer-tools' },
  'github': { name: 'GitHub', category: 'developer-tools' },
  'vercel': { name: 'Vercel', category: 'developer-tools' },
  'heroku': { name: 'Heroku', category: 'developer-tools' },
  'digitalocean': { name: 'DigitalOcean', category: 'developer-tools' },
  'aws': { name: 'AWS', category: 'cloud-storage' },
  'google cloud': { name: 'Google Cloud', category: 'cloud-storage' },
  'google one': { name: 'Google One', category: 'cloud-storage' },
  'dropbox': { name: 'Dropbox', category: 'cloud-storage' },
  'icloud': { name: 'iCloud+', category: 'cloud-storage' },
  'openai': { name: 'OpenAI / ChatGPT', category: 'ai-tools' },
  'chatgpt': { name: 'ChatGPT Plus', category: 'ai-tools' },
  'claude': { name: 'Claude', category: 'ai-tools' },
  'anthropic': { name: 'Claude (Anthropic)', category: 'ai-tools' },
  'midjourney': { name: 'Midjourney', category: 'ai-tools' },
  'cursor': { name: 'Cursor', category: 'ai-tools' },
  'copilot': { name: 'GitHub Copilot', category: 'ai-tools' },
  'grammarly': { name: 'Grammarly', category: 'productivity' },
  'nordvpn': { name: 'NordVPN', category: 'other' },
  'expressvpn': { name: 'ExpressVPN', category: 'other' },
  'gym': { name: 'Gym Membership', category: 'health' },
  'peloton': { name: 'Peloton', category: 'health' },
  'headspace': { name: 'Headspace', category: 'health' },
  'duolingo': { name: 'Duolingo', category: 'education' },
  'coursera': { name: 'Coursera', category: 'education' },
  'nytimes': { name: 'New York Times', category: 'news' },
  'washingtonpost': { name: 'Washington Post', category: 'news' },
  'medium': { name: 'Medium', category: 'news' },
  'substack': { name: 'Substack', category: 'news' },
}

/**
 * Fetch message list from Gmail API
 */
async function searchMessages(token, query, maxResults = 50) {
  const url = `${GMAIL_API}/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gmail search failed: ${res.status} ${err}`)
  }
  const data = await res.json()
  return data.messages || []
}

/**
 * Fetch a single message's metadata + snippet
 */
async function getMessage(token, messageId) {
  const url = `${GMAIL_API}/messages/${messageId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

/**
 * Extract header value from Gmail message
 */
function getHeader(message, name) {
  const header = message.payload?.headers?.find(
    h => h.name.toLowerCase() === name.toLowerCase()
  )
  return header?.value || ''
}

/**
 * Try to extract a dollar amount from text
 */
function extractAmount(text) {
  // Match patterns like $9.99, $99.99, $199.00, USD 9.99, 9.99 USD
  const patterns = [
    /\$\s?(\d{1,5}(?:\.\d{2})?)/,
    /USD\s?(\d{1,5}(?:\.\d{2})?)/i,
    /(\d{1,5}\.\d{2})\s?USD/i,
    /€\s?(\d{1,5}(?:\.\d{2})?)/,
    /¥\s?(\d{1,6}(?:\.\d{2})?)/,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return parseFloat(match[1])
  }
  return null
}

/**
 * Try to detect billing cycle from text
 */
function detectBillingCycle(text) {
  const lower = text.toLowerCase()
  if (lower.includes('annual') || lower.includes('yearly') || lower.includes('/year') || lower.includes('per year')) return 'yearly'
  if (lower.includes('quarter') || lower.includes('/quarter')) return 'quarterly'
  if (lower.includes('week') || lower.includes('/week')) return 'weekly'
  return 'monthly' // default
}

/**
 * Try to match email content to a known service
 */
function matchService(from, subject, snippet) {
  const combined = `${from} ${subject} ${snippet}`.toLowerCase()
  for (const [keyword, info] of Object.entries(KNOWN_SERVICES)) {
    if (combined.includes(keyword)) {
      return info
    }
  }
  return null
}

/**
 * Extract a clean service name from From header if not a known service
 */
function extractServiceName(from) {
  // "Netflix <noreply@netflix.com>" → "Netflix"
  const nameMatch = from.match(/^"?([^"<]+)"?\s*</)
  if (nameMatch) {
    const name = nameMatch[1].trim()
    // Skip generic names
    if (!['noreply', 'billing', 'no-reply', 'receipt', 'support', 'payments'].some(g => name.toLowerCase().includes(g))) {
      return name
    }
  }
  // Try domain: noreply@netflix.com → Netflix
  const domainMatch = from.match(/@([^.>]+)/)
  if (domainMatch) {
    const domain = domainMatch[1]
    if (!['gmail', 'yahoo', 'outlook', 'hotmail', 'mail'].includes(domain.toLowerCase())) {
      return domain.charAt(0).toUpperCase() + domain.slice(1)
    }
  }
  return null
}

/**
 * Main scan function — searches Gmail and returns found subscriptions
 *
 * @param {string} token - Google OAuth access token
 * @param {function} onProgress - callback(current, total) for progress updates
 * @returns {Array} Found subscriptions
 */
export async function scanGmailForSubscriptions(token, onProgress) {
  if (!token) throw new Error('No Google token available. Please sign out and sign in again.')

  // Step 1: Search for subscription-related emails
  let allMessageIds = new Set()
  for (const query of SEARCH_QUERIES) {
    const messages = await searchMessages(token, query, 50)
    messages.forEach(m => allMessageIds.add(m.id))
  }

  const messageIds = [...allMessageIds]
  if (messageIds.length === 0) {
    return []
  }

  // Step 2: Fetch each message and extract subscription info
  const found = new Map() // key: service name → subscription data
  const total = Math.min(messageIds.length, 80) // cap at 80 messages

  for (let i = 0; i < total; i++) {
    if (onProgress) onProgress(i + 1, total)

    const msg = await getMessage(token, messageIds[i])
    if (!msg) continue

    const from = getHeader(msg, 'From')
    const subject = getHeader(msg, 'Subject')
    const date = getHeader(msg, 'Date')
    const snippet = msg.snippet || ''

    // Try to match a known service
    const known = matchService(from, subject, snippet)
    const serviceName = known?.name || extractServiceName(from)
    if (!serviceName) continue

    // Skip if we already found this service (keep the most recent one)
    const key = serviceName.toLowerCase()
    if (found.has(key)) continue

    // Extract amount and billing cycle
    const combinedText = `${subject} ${snippet}`
    const amount = extractAmount(combinedText)
    const billingCycle = detectBillingCycle(combinedText)

    found.set(key, {
      name: serviceName,
      category: known?.category || 'other',
      amount: amount || 0,
      currency: 'USD',
      billing_cycle: billingCycle,
      status: 'active',
      next_billing_date: null,
      notes: `Found via inbox scan`,
    })
  }

  // Return as array, sorted by most recent email first
  return [...found.values()]
}

/**
 * Quick check if we have a valid Gmail token
 */
export async function testGmailAccess(token) {
  try {
    const url = `${GMAIL_API}/profile`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.ok
  } catch {
    return false
  }
}
