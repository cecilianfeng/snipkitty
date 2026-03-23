// Supabase Edge Function: send-trial-warnings
// Triggered daily via pg_cron at 8am UTC.
// Finds subscriptions where is_trial=true AND trial_end_date = today + 3 days
// and sends a warning email via Resend.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'Snipcat <notifications@snipcat.app>'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const TRIAL_WARN_DAYS = 3 // always warn 3 days before trial ends

serve(async (req) => {
  if (CRON_SECRET) {
    const secret = req.headers.get('x-cron-secret')
    if (secret !== CRON_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const targetDate = new Date(today)
  targetDate.setUTCDate(targetDate.getUTCDate() + TRIAL_WARN_DAYS)
  const targetDateStr = targetDate.toISOString().split('T')[0]

  // Get all users with trial warnings + email notifications enabled
  const { data: prefs, error: prefsError } = await supabase
    .from('notification_preferences')
    .select('user_id, profiles(email, full_name)')
    .eq('free_trial_warnings_enabled', true)
    .eq('email_notifications_enabled', true)

  if (prefsError) {
    console.error('Failed to load prefs:', prefsError.message)
    return new Response(JSON.stringify({ error: prefsError.message }), { status: 500 })
  }

  let emailsSent = 0
  const errors: string[] = []

  for (const pref of (prefs || [])) {
    // Find active trial subscriptions ending on targetDate
    const { data: trials } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', pref.user_id)
      .eq('status', 'active')
      .eq('is_trial', true)
      .eq('trial_end_date', targetDateStr)

    if (!trials || trials.length === 0) continue

    const profile = Array.isArray(pref.profiles) ? pref.profiles[0] : pref.profiles
    const userEmail = profile?.email
    const userName = (profile?.full_name || '').split(' ')[0] || 'there'

    if (!userEmail) continue

    for (const sub of trials) {
      try {
        await sendTrialWarningEmail(userEmail, userName, sub)
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

async function sendTrialWarningEmail(
  email: string,
  name: string,
  sub: Record<string, unknown>,
) {
  const trialEnd = new Date((sub.trial_end_date as string) + 'T12:00:00Z')
  const dateFormatted = trialEnd.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
  const amount = sub.amount ? `$${Number(sub.amount).toFixed(2)}` : 'paid plan'

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#8b5cf6,#6366f1);padding:28px 32px;text-align:center;">
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,.8);letter-spacing:.05em;text-transform:uppercase;">Snipcat</p>
        <h1 style="margin:8px 0 0;font-size:24px;color:#fff;font-weight:700;">⚠️ Free Trial Ending Soon</h1>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:32px;">
        <p style="margin:0 0 16px;font-size:16px;color:#374151;">Hi ${name},</p>
        <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.6;">
          Your free trial of <strong>${sub.name}</strong> ends in <strong>3 days</strong>.
          After that, you'll be charged the regular rate unless you cancel.
        </p>
        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:14px;color:#6b7280;padding-bottom:10px;">Service</td>
                <td style="font-size:14px;font-weight:600;color:#111827;text-align:right;padding-bottom:10px;">${sub.name}</td>
              </tr>
              <tr>
                <td style="font-size:14px;color:#6b7280;padding-bottom:10px;">Trial ends</td>
                <td style="font-size:14px;font-weight:600;color:#111827;text-align:right;padding-bottom:10px;">${dateFormatted}</td>
              </tr>
              <tr style="border-top:1px solid #e9d5ff;">
                <td style="font-size:15px;color:#374151;font-weight:600;padding-top:10px;">Will charge</td>
                <td style="font-size:20px;font-weight:700;color:#7c3aed;text-align:right;padding-top:10px;">${amount}</td>
              </tr>
            </table>
          </td></tr>
        </table>
        <p style="margin:0 0 12px;font-size:14px;color:#6b7280;line-height:1.6;">
          <strong>Want to cancel?</strong> Log in to ${sub.name} and cancel before <strong>${dateFormatted}</strong> to avoid being charged.
        </p>
        <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
          <strong>Want to keep it?</strong> No action needed — you'll automatically continue on the paid plan.
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
      subject: `⚠️ Your ${sub.name} free trial ends in 3 days`,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error: ${err}`)
  }
}
