// Supabase Edge Function: send-weekly-digest
// Triggered daily via pg_cron at 8am UTC.
// Internally checks which users want their digest today
// (Every Monday = day 1, Every Friday = day 5, 1st of Month = date 1)
// then sends a spending summary email via Resend.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'Snipcat <notifications@snipcat.app>'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (CRON_SECRET) {
    const secret = req.headers.get('x-cron-secret')
    if (secret !== CRON_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const now = new Date()
  now.setUTCHours(0, 0, 0, 0)
  const dayOfWeek = now.getUTCDay()  // 0=Sun, 1=Mon, ..., 5=Fri
  const dateOfMonth = now.getUTCDate()

  // Determine which digest_day values apply today
  const todayDigestDays: string[] = []
  if (dayOfWeek === 1) todayDigestDays.push('monday')
  if (dayOfWeek === 5) todayDigestDays.push('friday')
  if (dateOfMonth === 1) todayDigestDays.push('first_of_month')

  if (todayDigestDays.length === 0) {
    return new Response(JSON.stringify({ success: true, emailsSent: 0, reason: 'No digests scheduled today' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Get users who want digest on today's day
  const { data: prefs, error: prefsError } = await supabase
    .from('notification_preferences')
    .select('user_id, weekly_digest_day, profiles(email, full_name)')
    .eq('weekly_digest_enabled', true)
    .eq('email_notifications_enabled', true)
    .in('weekly_digest_day', todayDigestDays)

  if (prefsError) {
    console.error('Failed to load prefs:', prefsError.message)
    return new Response(JSON.stringify({ error: prefsError.message }), { status: 500 })
  }

  let emailsSent = 0
  const errors: string[] = []

  for (const pref of (prefs || [])) {
    const profile = Array.isArray(pref.profiles) ? pref.profiles[0] : pref.profiles
    const userEmail = profile?.email
    const userName = (profile?.full_name || '').split(' ')[0] || 'there'

    if (!userEmail) continue

    // Fetch all active subscriptions for this user
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', pref.user_id)
      .eq('status', 'active')
      .order('next_billing_date', { ascending: true })

    if (!subs || subs.length === 0) continue

    try {
      await sendDigestEmail(userEmail, userName, subs, now, pref.weekly_digest_day)
      emailsSent++
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`${userEmail}: ${msg}`)
      console.error('Digest send failed:', msg)
    }
  }

  return new Response(JSON.stringify({ success: true, emailsSent, errors }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

type Subscription = {
  id: string
  name: string
  amount: number
  billing_cycle: string
  next_billing_date: string | null
  currency: string
  status: string
}

function calcMonthlyAmount(sub: Subscription): number {
  const a = Number(sub.amount)
  switch (sub.billing_cycle) {
    case 'yearly': return a / 12
    case 'quarterly': return a / 3
    case 'weekly': return a * 4.33
    default: return a
  }
}

async function sendDigestEmail(
  email: string,
  name: string,
  subs: Subscription[],
  today: Date,
  digestDay: string,
) {
  const totalMonthly = subs.reduce((sum, s) => sum + calcMonthlyAmount(s), 0)
  const totalYearly = totalMonthly * 12

  // Upcoming renewals in next 30 days
  const cutoff = new Date(today)
  cutoff.setUTCDate(cutoff.getUTCDate() + 30)
  const upcoming = subs
    .filter(s => {
      if (!s.next_billing_date) return false
      const d = new Date(s.next_billing_date + 'T12:00:00Z')
      return d >= today && d <= cutoff
    })
    .slice(0, 5)

  const periodLabel = digestDay === 'first_of_month' ? 'Monthly' : 'Weekly'

  const subRows = subs
    .slice(0, 10)
    .map(s => `
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;">${s.name}</td>
        <td style="padding:10px 0;font-size:14px;color:#374151;text-align:center;border-bottom:1px solid #f3f4f6;">${(s.billing_cycle || 'monthly').charAt(0).toUpperCase() + (s.billing_cycle || 'monthly').slice(1)}</td>
        <td style="padding:10px 0;font-size:14px;font-weight:600;color:#111827;text-align:right;border-bottom:1px solid #f3f4f6;">$${Number(s.amount).toFixed(2)}</td>
      </tr>`)
    .join('')

  const upcomingRows = upcoming.length > 0
    ? upcoming.map(s => {
      const d = new Date(s.next_billing_date! + 'T12:00:00Z')
      const daysLeft = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return `
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#374151;">${s.name}</td>
          <td style="padding:8px 0;font-size:13px;color:#6b7280;text-align:center;">${dateStr} (${daysLeft}d)</td>
          <td style="padding:8px 0;font-size:14px;font-weight:600;color:#F97316;text-align:right;">$${Number(s.amount).toFixed(2)}</td>
        </tr>`
    }).join('')
    : '<tr><td colspan="3" style="padding:12px 0;font-size:14px;color:#9ca3af;text-align:center;">No upcoming renewals in the next 30 days</td></tr>'

  const moreCount = subs.length > 10 ? `<p style="margin:8px 0 0;font-size:13px;color:#9ca3af;text-align:center;">…and ${subs.length - 10} more</p>` : ''

  const todayStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#F97316,#f59e0b);padding:28px 32px;text-align:center;">
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,.8);letter-spacing:.05em;text-transform:uppercase;">Snipcat · ${todayStr}</p>
        <h1 style="margin:8px 0 0;font-size:24px;color:#fff;font-weight:700;">📊 ${periodLabel} Spending Digest</h1>
      </td></tr>
      <!-- Summary cards -->
      <tr><td style="padding:28px 32px 0;">
        <p style="margin:0 0 16px;font-size:16px;color:#374151;">Hi ${name}, here's your subscription overview.</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="48%" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:18px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#9a3412;text-transform:uppercase;letter-spacing:.04em;">Monthly Total</p>
              <p style="margin:8px 0 0;font-size:28px;font-weight:700;color:#F97316;">$${totalMonthly.toFixed(2)}</p>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#14532d;text-transform:uppercase;letter-spacing:.04em;">Yearly Estimate</p>
              <p style="margin:8px 0 0;font-size:28px;font-weight:700;color:#16a34a;">$${totalYearly.toFixed(2)}</p>
            </td>
          </tr>
        </table>
      </td></tr>
      <!-- Subscriptions -->
      <tr><td style="padding:24px 32px 0;">
        <h2 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#111827;">Active Subscriptions (${subs.length})</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <th style="font-size:12px;color:#9ca3af;text-align:left;padding-bottom:8px;text-transform:uppercase;letter-spacing:.04em;">Service</th>
            <th style="font-size:12px;color:#9ca3af;text-align:center;padding-bottom:8px;text-transform:uppercase;letter-spacing:.04em;">Cycle</th>
            <th style="font-size:12px;color:#9ca3af;text-align:right;padding-bottom:8px;text-transform:uppercase;letter-spacing:.04em;">Amount</th>
          </tr>
          ${subRows}
        </table>
        ${moreCount}
      </td></tr>
      <!-- Upcoming -->
      <tr><td style="padding:24px 32px 0;">
        <h2 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#111827;">Upcoming Renewals (30 days)</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <th style="font-size:12px;color:#9ca3af;text-align:left;padding-bottom:8px;text-transform:uppercase;letter-spacing:.04em;">Service</th>
            <th style="font-size:12px;color:#9ca3af;text-align:center;padding-bottom:8px;text-transform:uppercase;letter-spacing:.04em;">Date</th>
            <th style="font-size:12px;color:#9ca3af;text-align:right;padding-bottom:8px;text-transform:uppercase;letter-spacing:.04em;">Amount</th>
          </tr>
          ${upcomingRows}
        </table>
      </td></tr>
      <!-- Footer -->
      <tr><td style="padding:24px 32px;margin-top:12px;text-align:center;">
        <p style="margin:0;font-size:13px;color:#9ca3af;">
          Sent by <a href="https://snipcat.app" style="color:#F97316;text-decoration:none;">Snipcat</a> &nbsp;·&nbsp;
          <a href="https://snipcat.app/reminders" style="color:#F97316;text-decoration:none;">Manage preferences</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: email,
      subject: `📊 Your ${periodLabel} Spending Digest — $${totalMonthly.toFixed(2)}/mo across ${subs.length} subs`,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error: ${err}`)
  }
}
