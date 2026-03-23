// Supabase Edge Function: notify-price-change
// Called from the client (Dashboard) when a scan detects a price change.
// Verifies the user's JWT, then sends a price change alert via Resend.
//
// Request body:
// {
//   subscriptionId: string,
//   subscriptionName: string,
//   oldAmount: number,
//   newAmount: number
// }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'Snipcat <notifications@snipcat.app>'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Verify user JWT
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Verify JWT and get user
  const userSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: authError } = await userSupabase.auth.getUser()

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Parse request body
  let body: {
    subscriptionId: string
    subscriptionName: string
    oldAmount: number
    newAmount: number
  }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { subscriptionId, subscriptionName, oldAmount, newAmount } = body

  // Use service role to check user's notification prefs
  const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const { data: prefs } = await adminSupabase
    .from('notification_preferences')
    .select('price_change_alerts_enabled, email_notifications_enabled')
    .eq('user_id', user.id)
    .maybeSingle()

  // Check if user has price alerts enabled (default true if no prefs yet)
  const priceAlertsEnabled = prefs?.price_change_alerts_enabled !== false
  const emailEnabled = prefs?.email_notifications_enabled !== false

  if (!priceAlertsEnabled || !emailEnabled) {
    return new Response(JSON.stringify({ success: true, skipped: true, reason: 'Notifications disabled' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Get user email from profile
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.email) {
    return new Response(JSON.stringify({ error: 'No email found for user' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Update subscription's last_amount
  await adminSupabase
    .from('subscriptions')
    .update({ last_amount: oldAmount, amount: newAmount })
    .eq('id', subscriptionId)
    .eq('user_id', user.id)

  const userName = (profile.full_name || '').split(' ')[0] || 'there'
  const diff = newAmount - oldAmount
  const changePercent = oldAmount > 0 ? ((diff / oldAmount) * 100).toFixed(1) : '∞'
  const isIncrease = diff > 0

  try {
    await sendPriceChangeEmail(
      profile.email,
      userName,
      subscriptionName,
      oldAmount,
      newAmount,
      diff,
      changePercent,
      isIncrease,
    )

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Email send failed:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function sendPriceChangeEmail(
  email: string,
  name: string,
  subName: string,
  oldAmount: number,
  newAmount: number,
  diff: number,
  changePercent: string,
  isIncrease: boolean,
) {
  const arrow = isIncrease ? '📈' : '📉'
  const changeColor = isIncrease ? '#dc2626' : '#16a34a'
  const changeLabel = isIncrease ? 'Price Increase' : 'Price Drop'
  const diffStr = isIncrease ? `+$${diff.toFixed(2)}` : `-$${Math.abs(diff).toFixed(2)}`
  const bgColor = isIncrease ? '#fef2f2' : '#f0fdf4'
  const borderColor = isIncrease ? '#fecaca' : '#bbf7d0'

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#1e293b,#334155);padding:28px 32px;text-align:center;">
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,.6);letter-spacing:.05em;text-transform:uppercase;">Snipcat</p>
        <h1 style="margin:8px 0 0;font-size:24px;color:#fff;font-weight:700;">${arrow} ${changeLabel} Detected</h1>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:32px;">
        <p style="margin:0 0 16px;font-size:16px;color:#374151;">Hi ${name},</p>
        <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.6;">
          We detected a price change for your <strong>${subName}</strong> subscription during your latest inbox scan.
        </p>
        <!-- Price comparison card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${bgColor};border:1px solid ${borderColor};border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;width:40%;">
                  <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;">Previous</p>
                  <p style="margin:8px 0 0;font-size:26px;font-weight:700;color:#6b7280;text-decoration:line-through;">$${oldAmount.toFixed(2)}</p>
                </td>
                <td style="text-align:center;width:20%;">
                  <p style="margin:0;font-size:24px;">→</p>
                </td>
                <td style="text-align:center;width:40%;">
                  <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;">New Price</p>
                  <p style="margin:8px 0 0;font-size:26px;font-weight:700;color:${changeColor};">$${newAmount.toFixed(2)}</p>
                </td>
              </tr>
              <tr>
                <td colspan="3" style="text-align:center;padding-top:16px;border-top:1px solid ${borderColor};margin-top:12px;">
                  <span style="font-size:16px;font-weight:700;color:${changeColor};">${diffStr} &nbsp;(${changePercent}%)</span>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
        <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
          This was detected by scanning your inbox. ${isIncrease
            ? 'If you didn\'t expect this increase, check your account directly.'
            : 'Enjoy the savings! 🎉'}
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
      subject: `${arrow} ${subName} price ${isIncrease ? 'increased' : 'dropped'}: $${oldAmount.toFixed(2)} → $${newAmount.toFixed(2)}`,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error: ${err}`)
  }
}
