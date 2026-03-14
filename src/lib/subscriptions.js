import { supabase } from './supabaseClient'

// Ensure profile exists (for users who signed up before the profiles table was created)
export async function ensureProfile(user) {
  // Use maybeSingle() instead of single() to avoid error when no row found
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!data) {
    // Use upsert to handle race conditions and RLS gracefully
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      email: user.email,
    }, { onConflict: 'id' })
    if (error) {
      console.warn('ensureProfile insert failed:', error.message)
    }
  }
}

// ─── PROFILES ───

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}
 
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}
 
// ─── SUBSCRIPTIONS ───
 
export async function getSubscriptions(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('next_billing_date', { ascending: true })
  if (error) throw error
  return data
}
 
export async function getSubscription(id) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}
 
export async function createSubscription(subscription) {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert(subscription)
    .select()
    .single()
  if (error) throw error
  return data
}
 
export async function updateSubscription(id, updates) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
 
export async function deleteSubscription(id) {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id)
  if (error) throw error
}
 
// ─── REMINDERS ───
 
export async function getReminders(userId) {
  const { data, error } = await supabase
    .from('reminders')
    .select('*, subscriptions(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
 
export async function createReminder(reminder) {
  const { data, error } = await supabase
    .from('reminders')
    .insert(reminder)
    .select()
    .single()
  if (error) throw error
  return data
}
 
export async function updateReminder(id, updates) {
  const { data, error } = await supabase
    .from('reminders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
 
export async function deleteReminder(id) {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)
  if (error) throw error
}
 
// ─── STATS HELPERS ───
 
export function calcMonthlyTotal(subscriptions) {
  return subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      switch (s.billing_cycle) {
        case 'yearly': return sum + s.amount / 12
        case 'quarterly': return sum + s.amount / 3
        case 'weekly': return sum + s.amount * 4.33
        default: return sum + s.amount
      }
    }, 0)
}

export function calcYearlyTotal(subscriptions) {
  return subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      switch (s.billing_cycle) {
        case 'yearly': return sum + s.amount
        case 'quarterly': return sum + s.amount * 4
        case 'weekly': return sum + s.amount * 52
        case 'monthly':
        default: return sum + s.amount * 12
      }
    }, 0)
}

/** Get the monthly equivalent for a single subscription */
export function getMonthlyEquivalent(sub) {
  if (!sub.amount) return 0
  switch (sub.billing_cycle) {
    case 'yearly': return sub.amount / 12
    case 'quarterly': return sub.amount / 3
    case 'weekly': return sub.amount * 4.33
    default: return sub.amount
  }
}

/** Get the yearly equivalent for a single subscription */
export function getYearlyEquivalent(sub) {
  if (!sub.amount) return 0
  switch (sub.billing_cycle) {
    case 'yearly': return sub.amount
    case 'quarterly': return sub.amount * 4
    case 'weekly': return sub.amount * 52
    case 'monthly':
    default: return sub.amount * 12
  }
}

/** Normalize cancelled savings to monthly equivalent */
export function calcCancelledSavingsMonthly(subscriptions) {
  return subscriptions
    .filter(s => s.status === 'cancelled')
    .reduce((sum, s) => sum + getMonthlyEquivalent(s), 0)
}

export function calcCancelledSavingsYearly(subscriptions) {
  return subscriptions
    .filter(s => s.status === 'cancelled')
    .reduce((sum, s) => sum + getYearlyEquivalent(s), 0)
}
 
export function getUpcomingRenewals(subscriptions, withinDays = 7) {
  const now = new Date()
  const cutoff = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000)
  return subscriptions.filter(s => {
    if (s.status !== 'active' || !s.next_billing_date) return false
    const d = new Date(s.next_billing_date)
    return d >= now && d <= cutoff
  })
}
 
export function groupByCategory(subscriptions) {
  const groups = {}
  for (const sub of subscriptions) {
    const cat = sub.category || 'other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(sub)
  }
  return groups
}
 
// Category display config
export const CATEGORIES = {
  'ai-tools': { label: 'AI Tools', color: 'bg-purple-100', textColor: 'text-purple-600' },
  'entertainment': { label: 'Entertainment', color: 'bg-red-100', textColor: 'text-red-500' },
  'productivity': { label: 'Productivity', color: 'bg-blue-100', textColor: 'text-blue-600' },
  'cloud-storage': { label: 'Cloud Storage', color: 'bg-sky-100', textColor: 'text-sky-600' },
  'developer-tools': { label: 'Developer Tools', color: 'bg-indigo-100', textColor: 'text-indigo-600' },
  'design': { label: 'Design & Creative', color: 'bg-rose-100', textColor: 'text-rose-600' },
  'music': { label: 'Music', color: 'bg-green-100', textColor: 'text-green-600' },
  'gaming': { label: 'Gaming', color: 'bg-violet-100', textColor: 'text-violet-600' },
  'news': { label: 'News & Media', color: 'bg-amber-100', textColor: 'text-amber-600' },
  'health': { label: 'Health & Fitness', color: 'bg-pink-100', textColor: 'text-pink-600' },
  'education': { label: 'Education', color: 'bg-cyan-100', textColor: 'text-cyan-600' },
  'security': { label: 'VPN & Security', color: 'bg-emerald-100', textColor: 'text-emerald-600' },
  'social': { label: 'Social & Communication', color: 'bg-orange-100', textColor: 'text-orange-600' },
  'hosting': { label: 'Domain & Hosting', color: 'bg-teal-100', textColor: 'text-teal-600' },
  'other': { label: 'Other', color: 'bg-gray-100', textColor: 'text-gray-600' },
}
 
