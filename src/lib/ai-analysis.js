/**
 * AI Email Analysis — calls Supabase Edge Function → Claude API
 * Used in Phase 4.5 of Gmail scanner to verify subscriptions and extract missing data
 */

const EDGE_FUNCTION_URL = 'https://zxhgviraiiytpdjbuhpy.supabase.co/functions/v1/analyze-email'
const SUPABASE_ANON_KEY = 'sb_publishable_c3MRfQVEtQUt6SdQFYq5Kw_kURhd3S8'

/**
 * Send a batch of emails to the Edge Function for AI analysis.
 * @param {Array<{subject, bodyText, from, domain}>} emails — max 10 per call
 * @returns {Promise<Array>} analysis results in same order as input
 */
export async function callAnalyzeEmail(emails) {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ emails }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Edge Function error ${response.status}: ${text}`)
  }

  const data = await response.json()
  if (!data.success) throw new Error(data.error || 'Edge Function returned error')
  return data.results || []
}

/**
 * Run AI analysis on all needsReview items.
 * - Filters out non-subscriptions (Endeavor Design, GANNI, etc.)
 * - Enhances real subscriptions with extracted amount/cycle/status
 *
 * @param {Array} needsReview — items from Phase 4
 * @param {Map} emailBodyMap — Map<itemIndex, {subject, bodyText, from, domain}>
 * @param {Function} onProgress — progress callback
 * @returns {Promise<Array>} filtered & enhanced needsReview items
 */
export async function runAIAnalysis(needsReview, emailBodyMap, onProgress) {
  if (!needsReview || needsReview.length === 0) return needsReview

  // Build the list of items to analyze with their email data
  const toAnalyze = [] // { index, email }
  for (let i = 0; i < needsReview.length; i++) {
    const emailData = emailBodyMap.get(i)
    if (emailData) {
      toAnalyze.push({ index: i, email: emailData })
    }
  }

  if (toAnalyze.length === 0) return needsReview

  if (onProgress) onProgress({
    phase: '4.5',
    message: `AI analyzing ${toAnalyze.length} items...`,
    current: 0,
    total: toAnalyze.length,
  })

  // Send in batches of 10 (Edge Function limit)
  const BATCH_SIZE = 10
  const allResults = new Map() // index → AI result

  for (let b = 0; b < toAnalyze.length; b += BATCH_SIZE) {
    const batch = toAnalyze.slice(b, b + BATCH_SIZE)
    try {
      const results = await callAnalyzeEmail(batch.map(x => x.email))
      for (let j = 0; j < results.length; j++) {
        allResults.set(batch[j].index, results[j])
      }
    } catch (err) {
      console.warn(`AI batch ${b / BATCH_SIZE + 1} failed:`, err)
      // Continue with next batch — don't fail everything
    }

    if (onProgress) onProgress({
      phase: '4.5',
      message: `AI analyzed ${Math.min(b + BATCH_SIZE, toAnalyze.length)} of ${toAnalyze.length}`,
      current: Math.min(b + BATCH_SIZE, toAnalyze.length),
      total: toAnalyze.length,
    })
  }

  // Apply AI results: filter out non-subscriptions, enhance real ones
  const filtered = []
  for (let i = 0; i < needsReview.length; i++) {
    const item = needsReview[i]
    const aiResult = allResults.get(i)

    if (!aiResult) {
      // No AI result — keep item as-is
      filtered.push(item)
      continue
    }

    // If AI says NOT a subscription with high/medium confidence → remove it
    if (!aiResult.isSubscription && (aiResult.confidence === 'high' || aiResult.confidence === 'medium')) {
      console.log(`AI filtered out: ${item.name} — ${aiResult.reason}`)
      continue // skip this item
    }

    // If AI says IS a subscription → enhance with extracted data
    if (aiResult.isSubscription) {
      if (aiResult.serviceName && aiResult.confidence !== 'low') {
        // Use AI name if current name looks generic (just a domain)
        if (item.name === item._domain || !item.name) {
          item.name = aiResult.serviceName
        }
      }
      if (!item.amount && aiResult.amount) item.amount = aiResult.amount
      if (!item.currency && aiResult.currency) item.currency = aiResult.currency
      if (!item.billing_cycle && aiResult.billingCycle) item.billing_cycle = aiResult.billingCycle
      if (!item.next_billing_date && aiResult.nextBillingDate) item.next_billing_date = aiResult.nextBillingDate
      if (aiResult.status === 'cancelled') item.status = 'cancelled'
      item.notes = `${item.notes || ''} (AI: ${aiResult.confidence})`.trim()
      item._aiVerified = true
      item._aiConfidence = aiResult.confidence
    }

    filtered.push(item)
  }

  if (onProgress) onProgress({
    phase: '4.5',
    message: `AI done — kept ${filtered.length} of ${needsReview.length}`,
    current: toAnalyze.length,
    total: toAnalyze.length,
  })

  return filtered
}
