import { supabase } from './supabaseClient'

const SUPABASE_URL = 'https://zxhgviraiiytpdjbuhpy.supabase.co'

// ─── Default preference values ───
export const DEFAULT_PREFS = {
  renewal_reminders_enabled: true,
  renewal_days_before: 3,
  price_change_alerts_enabled: true,
  free_trial_warnings_enabled: true,
  weekly_digest_enabled: false,
  weekly_digest_day: 'monday',
  email_notifications_enabled: true,
}

// Map UI label → DB value for renewal days
export const RENEWAL_DAYS_OPTIONS = [
  { label: '1 day before', value: 1 },
  { label: '3 days before', value: 3 },
  { label: '7 days before', value: 7 },
]

// Map UI label → DB value for digest day
export const DIGEST_DAY_OPTIONS = [
  { label: 'Every Monday', value: 'monday' },
  { label: 'Every Friday', value: 'friday' },
  { label: '1st of Month', value: 'first_of_month' },
]

// ─── Fetch preferences (returns defaults if no row yet) ───
export async function getNotificationPrefs(userId) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data ? data : { ...DEFAULT_PREFS, user_id: userId }
}

// ─── Upsert (create or update) preferences ───
export async function upsertNotificationPrefs(userId, updates) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert(
      { user_id: userId, ...updates },
      { onConflict: 'user_id' },
    )
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Notify price change (calls Edge Function) ───
export async function notifyPriceChange({ subscriptionId, subscriptionName, oldAmount, newAmount }) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/notify-price-change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: 'sb_publishable_c3MRfQVEtQUt6SdQFYq5Kw_kURhd3S8',
      },
      body: JSON.stringify({ subscriptionId, subscriptionName, oldAmount, newAmount }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.warn('Price change notification failed:', err)
    }
  } catch (err) {
    console.warn('Price change notification error:', err)
  }
}
