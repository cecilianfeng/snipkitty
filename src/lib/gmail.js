/**
 * Gmail Inbox Scanner for SnipKitty (V2)
 *
 * V1 Scope: Only SaaS software + streaming subscriptions.
 * Excluded: utility bills, one-time purchases, retail orders.
 *
 * Strategy:
 * 1. Search Gmail specifically for BILLING / RECEIPT / INVOICE emails
 * 2. Check blocklist first (from + subject)
 * 3. Match known services by FROM domain only (not body text)
 * 4. Even known services must have billing evidence in the email
 * 5. Use hardcoded logos for known services, favicon API as fallback
 */

const GMAIL_API = 'https://www.googleapis.com/gmail/v1/users/me'

// ─── KNOWN SUBSCRIPTION SERVICES ───
// Matched by FROM domain. logo = actual service website for favicon.
const KNOWN_SUBSCRIPTIONS = {
  // AI Tools
  'openai.com':      { name: 'ChatGPT Plus', category: 'ai-tools', logo: 'openai.com' },
  'anthropic.com':   { name: 'Claude Pro', category: 'ai-tools', logo: 'claude.ai' },
  'claude.ai':       { name: 'Claude Pro', category: 'ai-tools', logo: 'claude.ai' },
  'midjourney.com':  { name: 'Midjourney', category: 'ai-tools', logo: 'midjourney.com' },
  'cursor.com':      { name: 'Cursor', category: 'ai-tools', logo: 'cursor.com' },
  'cursor.sh':       { name: 'Cursor', category: 'ai-tools', logo: 'cursor.com' },
  'perplexity.ai':   { name: 'Perplexity', category: 'ai-tools', logo: 'perplexity.ai' },
  'jasper.ai':       { name: 'Jasper AI', category: 'ai-tools', logo: 'jasper.ai' },
  'runwayml.com':    { name: 'Runway', category: 'ai-tools', logo: 'runwayml.com' },
  'elevenlabs.io':   { name: 'ElevenLabs', category: 'ai-tools', logo: 'elevenlabs.io' },

  // Entertainment / Streaming
  'netflix.com':       { name: 'Netflix', category: 'entertainment', logo: 'netflix.com' },
  'disneyplus.com':    { name: 'Disney+', category: 'entertainment', logo: 'disneyplus.com' },
  'hulu.com':          { name: 'Hulu', category: 'entertainment', logo: 'hulu.com' },
  'hbomax.com':        { name: 'HBO Max', category: 'entertainment', logo: 'hbomax.com' },
  'max.com':           { name: 'Max', category: 'entertainment', logo: 'max.com' },
  'paramountplus.com': { name: 'Paramount+', category: 'entertainment', logo: 'paramountplus.com' },
  'crunchyroll.com':   { name: 'Crunchyroll', category: 'entertainment', logo: 'crunchyroll.com' },
  'primevideo.com':    { name: 'Amazon Prime Video', category: 'entertainment', logo: 'primevideo.com' },
  'youtube.com':       { name: 'YouTube Premium', category: 'entertainment', logo: 'youtube.com' },
  'apple.com':         { name: 'Apple (Subscription)', category: 'entertainment', logo: 'apple.com' },
  'crave.ca':          { name: 'Crave', category: 'entertainment', logo: 'crave.ca' },

  // Music
  'spotify.com':     { name: 'Spotify', category: 'music', logo: 'spotify.com' },
  'tidal.com':       { name: 'Tidal', category: 'music', logo: 'tidal.com' },
  'deezer.com':      { name: 'Deezer', category: 'music', logo: 'deezer.com' },

  // Productivity
  'notion.so':         { name: 'Notion', category: 'productivity', logo: 'notion.so' },
  'slack.com':         { name: 'Slack', category: 'productivity', logo: 'slack.com' },
  'zoom.us':           { name: 'Zoom', category: 'productivity', logo: 'zoom.us' },
  'canva.com':         { name: 'Canva', category: 'productivity', logo: 'canva.com' },
  'adobe.com':         { name: 'Adobe Creative Cloud', category: 'productivity', logo: 'adobe.com' },
  'grammarly.com':     { name: 'Grammarly', category: 'productivity', logo: 'grammarly.com' },
  'todoist.com':       { name: 'Todoist', category: 'productivity', logo: 'todoist.com' },
  'evernote.com':      { name: 'Evernote', category: 'productivity', logo: 'evernote.com' },
  'linear.app':        { name: 'Linear', category: 'productivity', logo: 'linear.app' },
  '1password.com':     { name: '1Password', category: 'productivity', logo: '1password.com' },
  'lastpass.com':      { name: 'LastPass', category: 'productivity', logo: 'lastpass.com' },
  'bitwarden.com':     { name: 'Bitwarden', category: 'productivity', logo: 'bitwarden.com' },
  'dashlane.com':      { name: 'Dashlane', category: 'productivity', logo: 'dashlane.com' },

  // Developer Tools
  'github.com':        { name: 'GitHub', category: 'developer-tools', logo: 'github.com' },
  'gitlab.com':        { name: 'GitLab', category: 'developer-tools', logo: 'gitlab.com' },
  'figma.com':         { name: 'Figma', category: 'developer-tools', logo: 'figma.com' },
  'vercel.com':        { name: 'Vercel', category: 'developer-tools', logo: 'vercel.com' },
  'netlify.com':       { name: 'Netlify', category: 'developer-tools', logo: 'netlify.com' },
  'heroku.com':        { name: 'Heroku', category: 'developer-tools', logo: 'heroku.com' },
  'digitalocean.com':  { name: 'DigitalOcean', category: 'developer-tools', logo: 'digitalocean.com' },
  'railway.app':       { name: 'Railway', category: 'developer-tools', logo: 'railway.app' },
  'render.com':        { name: 'Render', category: 'developer-tools', logo: 'render.com' },
  'supabase.com':      { name: 'Supabase', category: 'developer-tools', logo: 'supabase.com' },
  'supabase.io':       { name: 'Supabase', category: 'developer-tools', logo: 'supabase.com' },
  'postman.com':       { name: 'Postman', category: 'developer-tools', logo: 'postman.com' },
  'jetbrains.com':     { name: 'JetBrains', category: 'developer-tools', logo: 'jetbrains.com' },
  'replit.com':        { name: 'Replit', category: 'developer-tools', logo: 'replit.com' },

  // Cloud Storage
  'google.com':        { name: 'Google One', category: 'cloud-storage', logo: 'one.google.com' },
  'dropbox.com':       { name: 'Dropbox', category: 'cloud-storage', logo: 'dropbox.com' },
  'box.com':           { name: 'Box', category: 'cloud-storage', logo: 'box.com' },

  // VPN / Security
  'nordvpn.com':       { name: 'NordVPN', category: 'other', logo: 'nordvpn.com' },
  'expressvpn.com':    { name: 'ExpressVPN', category: 'other', logo: 'expressvpn.com' },
  'surfshark.com':     { name: 'Surfshark', category: 'other', logo: 'surfshark.com' },
  'protonvpn.com':     { name: 'ProtonVPN', category: 'other', logo: 'protonvpn.com' },
  'proton.me':         { name: 'Proton', category: 'other', logo: 'proton.me' },

  // Education
  'duolingo.com':    { name: 'Duolingo Plus', category: 'education', logo: 'duolingo.com' },
  'coursera.org':    { name: 'Coursera', category: 'education', logo: 'coursera.org' },
  'skillshare.com':  { name: 'Skillshare', category: 'education', logo: 'skillshare.com' },
  'masterclass.com': { name: 'MasterClass', category: 'education', logo: 'masterclass.com' },
  'brilliant.org':   { name: 'Brilliant', category: 'education', logo: 'brilliant.org' },

  // Health
  'headspace.com':    { name: 'Headspace', category: 'health', logo: 'headspace.com' },
  'calm.com':         { name: 'Calm', category: 'health', logo: 'calm.com' },
  'onepeloton.com':   { name: 'Peloton', category: 'health', logo: 'onepeloton.com' },
  'strava.com':       { name: 'Strava', category: 'health', logo: 'strava.com' },

  // News / Media
  'medium.com':           { name: 'Medium', category: 'news', logo: 'medium.com' },
  'substack.com':         { name: 'Substack', category: 'news', logo: 'substack.com' },
  'nytimes.com':          { name: 'New York Times', category: 'news', logo: 'nytimes.com' },
  'washingtonpost.com':   { name: 'Washington Post', category: 'news', logo: 'washingtonpost.com' },
  'theathletic.com':      { name: 'The Athletic', category: 'news', logo: 'theathletic.com' },
}

// ─── BLOCKLIST: Known non-subscription senders ───
const BLOCKLIST = [
  // Telecom / ISPs / Utilities
  'bell.ca', 'bell.net', 'rogers.com', 'telus.com', 'fido.ca', 'koodo.com',
  'virginmobile', 'shaw.ca', 'att.com', 'verizon.com', 'tmobile.com',
  't-mobile.com', 'comcast.com', 'xfinity.com', 'spectrum.com',
  'hydroone', 'enbridge', 'fortisbc', 'bchydro',
  // Retailers
  'bestbuy', 'walmart', 'amazon.ca', 'amazon.com', 'costco',
  'target.com', 'ikea.com', 'homedepot', 'lowes.com', 'staples',
  'winners', 'marshalls', 'tjmaxx',
  'aritzia', 'zara.com', 'hm.com', 'uniqlo', 'gap.com', 'oldnavy',
  'lululemon', 'oak+fort', 'oakandfort', 'sephora', 'ulta.com', 'nordstrom',
  // Transportation / Car
  'uber.com', 'lyft.com', 'turo.com', 'enterprise.com', 'hertz.com',
  'geico.com', 'progressive.com',
  '407etr', '407 etr',
  // Food delivery
  'doordash', 'ubereats', 'skipthedishes', 'grubhub', 'instacart',
  // Banks / Finance
  'paypal.com', 'venmo.com', 'interac', 'scotiabank', 'tdbank', 'td.com',
  'rbc.com', 'rbcroyalbank', 'bmo.com', 'cibc.com',
  'americanexpress', 'chase.com',
  // Government
  'cra-arc', 'canada.ca', 'irs.gov',
  // Shipping
  'fedex.com', 'ups.com', 'usps.com', 'canadapost', 'dhl.com', 'purolator',
  // Travel
  'airbnb.com', 'booking.com', 'expedia.com', 'hotels.com',
  // Real estate
  'zillow', 'realtor.com', 'redfin',
  // Fashion / Clothing
  'shein.com', 'fashionnova', 'revolve.com', 'ssense.com', 'farfetch',
  'abercrombie', 'hollister', 'jcrew.com', 'madewell',
  // Other retail
  'etsy.com', 'wayfair.com', 'indigo.ca', 'chapters.indigo',
]

// ─── BILLING / PAYMENT KEYWORDS ───
// Email MUST contain at least one of these to be considered a real subscription charge
const BILLING_KEYWORDS = [
  'receipt', 'invoice', 'payment', 'charged', 'billing',
  'your bill', 'amount due', 'total:', 'transaction',
  'paid', 'charge of', 'payment of', 'debited',
  'subscription renew', 'renewal', 'auto-renew', 'recurring',
  'next billing', 'billing period', 'billing cycle',
  'thank you for your payment', 'payment confirmation',
  'payment received', 'successfully charged',
]

// ─── ONE-TIME PURCHASE KEYWORDS (reduce score) ───
const ONE_TIME_KEYWORDS = [
  'order confirmation', 'order #', 'order number', 'shipping',
  'shipped', 'delivered', 'tracking number', 'track your',
  'your order', 'purchase confirmation', 'one-time', 'one time',
  'return', 'refund', 'exchange', 'warranty',
]

// ─── GMAIL API HELPERS ───

async function searchMessages(token, query, maxResults = 100) {
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

async function getMessage(token, messageId) {
  const url = `${GMAIL_API}/messages/${messageId}?format=full`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

function getHeader(message, name) {
  const header = message.payload?.headers?.find(
    h => h.name.toLowerCase() === name.toLowerCase()
  )
  return header?.value || ''
}

/**
 * Decode base64url encoded email body
 */
function decodeBody(payload) {
  let body = ''

  if (payload.body?.data) {
    try {
      body = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
    } catch (e) {
      body = ''
    }
  }

  if (!body && payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        try {
          body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'))
          break
        } catch (e) { /* skip */ }
      }
    }
    if (!body) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          try {
            const html = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'))
            body = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
            break
          } catch (e) { /* skip */ }
        }
        if (part.parts) {
          for (const sub of part.parts) {
            if (sub.body?.data) {
              try {
                const decoded = atob(sub.body.data.replace(/-/g, '+').replace(/_/g, '/'))
                if (sub.mimeType === 'text/plain') {
                  body = decoded
                  break
                } else if (sub.mimeType === 'text/html') {
                  body = decoded.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
                }
              } catch (e) { /* skip */ }
            }
          }
          if (body) break
        }
      }
    }
  }

  return body
}

/**
 * Extract dollar amounts from text, return the most likely subscription price
 */
function extractAmount(text) {
  const patterns = [
    /(?:CA)?\$\s?(\d{1,5}\.\d{2})/g,
    /USD\s?(\d{1,5}\.\d{2})/gi,
    /(\d{1,5}\.\d{2})\s?(?:USD|CAD)/gi,
  ]

  const amounts = []
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const val = parseFloat(match[1])
      if (val > 0 && val < 1000) {
        amounts.push(val)
      }
    }
  }

  if (amounts.length === 0) return null

  // Return most common amount, or if all unique, the first one
  const countMap = {}
  for (const a of amounts) {
    countMap[a] = (countMap[a] || 0) + 1
  }
  const sorted = Object.entries(countMap).sort((a, b) => b[1] - a[1])
  return parseFloat(sorted[0][0])
}

/**
 * Detect billing cycle from email text
 */
function detectBillingCycle(text) {
  const lower = text.toLowerCase()
  if (lower.includes('annual') || lower.includes('yearly') || lower.includes('/year') || lower.includes('per year') || lower.includes('/yr')) return 'yearly'
  if (lower.includes('quarter') || lower.includes('/quarter')) return 'quarterly'
  if (lower.includes('weekly') || lower.includes('/week')) return 'weekly'
  return 'monthly'
}

/**
 * Extract the full domain from a From header (e.g., "noreply@billing.spotify.com" → "billing.spotify.com")
 */
function extractFullDomain(from) {
  const match = from.match(/@([^\s>]+)/)
  return match ? match[1].toLowerCase() : ''
}

/**
 * Check if FROM domain matches a blocklisted sender
 */
function isBlocklisted(from, subject) {
  const fromLower = from.toLowerCase()
  const subjectLower = subject.toLowerCase()
  for (const blocked of BLOCKLIST) {
    if (fromLower.includes(blocked) || subjectLower.includes(blocked)) return true
  }
  return false
}

/**
 * Match email FROM domain to a known subscription service.
 * Only matches on the sender domain, NOT the body text.
 */
function matchKnownService(from) {
  const domain = extractFullDomain(from)
  if (!domain) return null

  for (const [serviceDomain, info] of Object.entries(KNOWN_SUBSCRIPTIONS)) {
    // Match if sender domain ends with or contains the service domain
    // e.g., "billing.spotify.com" matches "spotify.com"
    if (domain === serviceDomain || domain.endsWith('.' + serviceDomain)) {
      return info
    }
  }
  return null
}

/**
 * Check if email has billing/payment evidence (not just a notification or welcome email)
 */
function hasBillingEvidence(subject, bodyText) {
  const combined = `${subject} ${bodyText}`.toLowerCase()

  // Check for one-time purchase indicators first
  let oneTimeScore = 0
  for (const kw of ONE_TIME_KEYWORDS) {
    if (combined.includes(kw)) oneTimeScore++
  }
  if (oneTimeScore >= 2) return false

  // Must have at least one billing keyword
  for (const kw of BILLING_KEYWORDS) {
    if (combined.includes(kw)) return true
  }
  return false
}

/**
 * Get logo URL using Google Favicon API with the correct service domain
 */
function getLogoUrl(logoDomain) {
  if (!logoDomain) return null
  return `https://www.google.com/s2/favicons?domain=${logoDomain}&sz=64`
}

/**
 * Extract a clean service name from From header
 */
function extractServiceName(from) {
  const nameMatch = from.match(/^"?([^"<]+)"?\s*</)
  if (nameMatch) {
    const name = nameMatch[1].trim()
    const skipNames = ['noreply', 'billing', 'no-reply', 'receipt', 'support', 'payments', 'info', 'team', 'hello', 'notifications', 'mailer']
    if (!skipNames.some(g => name.toLowerCase().includes(g))) {
      return name
    }
  }
  const domainMatch = from.match(/@([^.>]+)/)
  if (domainMatch) {
    const domain = domainMatch[1]
    const skipDomains = ['gmail', 'yahoo', 'outlook', 'hotmail', 'mail', 'email']
    if (!skipDomains.includes(domain.toLowerCase())) {
      return domain.charAt(0).toUpperCase() + domain.slice(1)
    }
  }
  return null
}

/**
 * Main scan function — searches Gmail for PAID subscriptions
 *
 * @param {string} token - Google OAuth access token
 * @param {function} onProgress - callback(current, total) for progress updates
 * @returns {Array} Found subscriptions with logo_url
 */
export async function scanGmailForSubscriptions(token, onProgress) {
  if (!token) throw new Error('No Google token available. Please sign out and sign in again.')

  // Search specifically for BILLING / RECEIPT / PAYMENT emails (last 12 months)
  // This targets emails that actually contain payment info, not just notifications
  const query = [
    '(subject:(receipt OR invoice OR "payment confirmation" OR "billing statement"',
    'OR "your bill" OR "payment received" OR "successfully charged"',
    'OR "subscription renewed" OR "renewal" OR "auto-renew"',
    'OR "amount charged" OR "transaction"))',
    'newer_than:12m',
    '-category:promotions',
    '-category:social',
  ].join(' ')

  const messages = await searchMessages(token, query, 100)
  if (messages.length === 0) return []

  const found = new Map() // key: normalized name → subscription data
  const total = Math.min(messages.length, 100)

  for (let i = 0; i < total; i++) {
    if (onProgress) onProgress(i + 1, total)

    const msg = await getMessage(token, messages[i].id)
    if (!msg) continue

    const from = getHeader(msg, 'From')
    const subject = getHeader(msg, 'Subject')

    // FIRST: check blocklist on from + subject
    if (isBlocklisted(from, subject)) continue

    const bodyText = decodeBody(msg.payload)
    const fullText = `${subject} ${bodyText}`

    // SECOND: Must have billing/payment evidence in the email
    if (!hasBillingEvidence(subject, bodyText)) continue

    // THIRD: Check if it's a known subscription service (by FROM domain only)
    const known = matchKnownService(from)

    if (known) {
      const key = known.name.toLowerCase()
      if (found.has(key)) {
        // Update price if this email has a better (non-zero) price
        const existing = found.get(key)
        if (existing.amount === 0) {
          const newAmount = extractAmount(fullText)
          if (newAmount) {
            existing.amount = newAmount
            existing.billing_cycle = detectBillingCycle(fullText)
          }
        }
        continue
      }

      found.set(key, {
        name: known.name,
        category: known.category,
        amount: extractAmount(fullText) || 0,
        currency: 'CAD',
        billing_cycle: detectBillingCycle(fullText),
        status: 'active',
        next_billing_date: null,
        logo_url: getLogoUrl(known.logo),
        notes: 'Found via inbox scan',
      })
      continue
    }

    // FOURTH: Unknown service — extract name from From header
    const serviceName = extractServiceName(from)
    if (!serviceName) continue

    const key = serviceName.toLowerCase()
    if (found.has(key)) {
      const existing = found.get(key)
      if (existing.amount === 0) {
        const newAmount = extractAmount(fullText)
        if (newAmount) {
          existing.amount = newAmount
          existing.billing_cycle = detectBillingCycle(fullText)
        }
      }
      continue
    }

    // For unknown services, get logo from email sender domain
    const senderDomain = extractFullDomain(from)

    found.set(key, {
      name: serviceName,
      category: 'other',
      amount: extractAmount(fullText) || 0,
      currency: 'CAD',
      billing_cycle: detectBillingCycle(fullText),
      status: 'active',
      next_billing_date: null,
      logo_url: senderDomain ? getLogoUrl(senderDomain) : null,
      notes: 'Found via inbox scan',
    })
  }

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
