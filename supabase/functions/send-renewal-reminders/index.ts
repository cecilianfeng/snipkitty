// Supabase Edge Function: send-renewal-reminders
// Triggered daily via pg_cron at 8am UTC.
// Finds subscriptions renewing in user's chosen # of days (1/3/7)
// and sends an email reminder via Resend.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'Snipcat <notifications@snipcat.app>'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Verify cron secret
  if (CRON_SECRET) {
    const secret = req.headers.get('x-cron-secret')
    if (secret !== CRON_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  // Get all users with renewal reminders + email notifications enabled
  const { data: prefs, error: prefsError } = await supabase
    .from('notification_preferences')
    .select('user_id, renewal_days_before, profiles(email, full_name)')
    .eq('renewal_reminders_enabled', true)
    .eq('email_notifications_enabled', true)

  if (prefsError) {
    console.error('Failed to load prefs:', prefsError.message)
    return new Response(JSON.stringify({ error: prefsError.message }), { status: 500 })
  }

  let emailsSent = 0
  const errors: string[] = []

  for (const pref of (prefs || [])) {
    const daysToCheck: number = pref.renewal_days_before || 3

    const targetDate = new Date(today)
    targetDate.setUTCDate(targetDate.getUTCDate() + daysToCheck)
    const targetDateStr = targetDate.toISOString().split('T')[0]

    // Find active, non-trial subscriptions renewing on targetDate
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', pref.user_id)
      .eq('status', 'active')
      .eq('next_billing_date', targetDateStr)
      .or('is_trial.is.null,is_trial.eq.false')

    if (!subs || subs.length === 0) continue

    const profile = Array.isArray(pref.profiles) ? pref.profiles[0] : pref.profiles
    const userEmail = profile?.email
    const userName = (profile?.full_name || '').split(' ')[0] || 'there'

    if (!userEmail) continue

    for (const sub of subs) {
      try {
        await sendRenewalEmail(userEmail, userName, sub, daysToCheck)
        emailsSent++
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`${sub.name}: ${msg}`)
        console.error('Email send failed:', msg)
      }
    }
  }

  return new Response(JSON.stringify({ success: true, emailsSent, errors }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

async function sendRenewalEmail(
  email: string,
  name: string,
  sub: Record<string, unknown>,
  daysLeft: number,
) {
  const dayText = daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`
  const renewDate = new Date((sub.next_billing_date as string) + 'T12:00:00Z')
  const dateFormatted = renewDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
  const amount = `$${Number(sub.amount).toFixed(2)}`
  const cycle = (sub.billing_cycle as string) || 'monthly'

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#F97316,#ef4444);padding:28px 32px;text-align:center;">
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,.8);letter-spacing:.05em;text-transform:uppercase;">Snipcat</p>
        <h1 style="margin:8px 0 0;font-size:24px;color:#fff;font-weight:700;">⏰ Renewal Reminder</h1>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:32px;">
        <p style="margin:0 0 16px;font-size:16px;color:#374151;">Hi ${name},</p>
        <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.6;">
          Your <strong>${sub.name}</strong> subscription is set to renew <strong>${dayText}</strong>.
        </p>
        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:14px;color:#6b7280;padding-bottom:10px;">Service</td>
                <td style="font-size:14px;font-weight:600;color:#111827;text-align:right;padding-bottom:10px;">${sub.name}</td>
              </tr>
              <tr>
                <td style="font-size:14px;color:#6b7280;padding-bottom:10px;">Renewal date</td>
                <td style="font-size:14px;font-weight:600;color:#111827;text-align:right;padding-bottom:10px;">${dateFormatted}</td>
              </tr>
              <tr>
                <td style="font-size:14px;color:#6b7280;padding-bottom:10px;">Billing cycle</td>
                <td style="font-size:14px;font-weight:600;color:#111827;text-align:right;padding-bottom:10px;">${cycle.charAt(0).toUpperCase() + cycle.slice(1)}</td>
              </tr>
              <tr style="border-top:1px solid #e5e7eb;">
                <td style="font-size:15px;color:#374151;font-weight:600;padding-top:10px;">Amount</td>
                <td style="font-size:20px;font-weight:700;color:#F97316;text-align:right;padding-top:10px;">${amount}</td>
              </tr>
            </table>
          </td></tr>
        </table>
        <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
          Make sure your payment method is up to date to avoid any interruption.
        </p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
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
      subject: `⏰ ${sub.name} renews ${dayText} — ${amount}`,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error: ${err}`)
  }
}
