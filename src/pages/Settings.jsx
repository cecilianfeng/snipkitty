import { useState } from 'react'
import { Check, Mail, Info, Plus } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { getSubscriptions } from '../lib/subscriptions'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { user, profile, signOut } = useAuth()

  // Derive user info from Google auth
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const email = user?.email || ''
  const avatarUrl = user?.user_metadata?.avatar_url
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Profile section
  const [displayName, setDisplayName] = useState(fullName)

  // Connected accounts section
  const [connectedAccounts, setConnectedAccounts] = useState({
    gmail: true,
    outlook: false,
    apple: false,
  })

  // Data & Privacy section
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
  const [exporting, setExporting] = useState(false)

  const handleAccountConnect = (account) => {
    setConnectedAccounts(prev => ({
      ...prev,
      [account]: !prev[account]
    }))
  }

  const handleSaveProfile = () => {
    // In a real app, this would save to Supabase profiles table
    console.log('Saving profile with displayName:', displayName)
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const subs = await getSubscriptions(user.id)
      if (!subs || subs.length === 0) {
        alert('No subscriptions to export.')
        setExporting(false)
        return
      }
      const headers = ['Name', 'Category', 'Amount', 'Currency', 'Billing Cycle', 'Status', 'Next Billing Date', 'Start Date', 'Notes']
      const rows = subs.map(s => [
        s.name || '',
        s.category || '',
        s.amount || 0,
        s.currency || 'USD',
        s.billing_cycle || '',
        s.status || '',
        s.next_billing_date || '',
        s.start_date || '',
        (s.notes || '').replace(/"/g, '""'),
      ])
      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(v => `"${v}"`).join(','))
      ].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `snipcat-subscriptions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export data.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-[#111827]">Settings</h1>
          <p className="text-[#6B7280] mt-2">Manage your account, connections, and preferences.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* Section 1: Profile */}
        <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB]">
          <h2 className="text-2xl font-bold text-[#111827] mb-6">Profile</h2>

          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-6 mb-8">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#F97316] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-bold">{initials}</span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#111827]">{fullName}</h3>
              <p className="text-[#6B7280]">{email}</p>
              <p className="text-sm text-[#9CA3AF] mt-1 capitalize">
                {profile?.plan || 'Free'} Plan
              </p>
            </div>
          </div>

          {/* Profile Inputs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-xl bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="px-6 py-2 bg-[#F97316] text-white rounded-full font-semibold hover:bg-[#EA580C] shadow-[0_4px_16px_rgba(249,115,22,0.3)] transition-colors"
          >
            Save Changes
          </button>
        </div>

        {/* Section 2: Connected Accounts */}
        <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB]">
          <h2 className="text-2xl font-bold text-[#111827] mb-2">Connected Accounts</h2>
          <p className="text-[#6B7280] mb-6">Connect your email accounts to enable smart subscription detection.</p>

          <div className="space-y-4 mb-6">
            {/* Gmail — Primary (connected via login) */}
            <div className="p-5 rounded-2xl border-2 border-[#22C55E]/20 bg-[#22C55E]/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <Mail className="text-red-500" size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#111827]">Gmail</h3>
                      <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Primary</span>
                    </div>
                    <p className="text-sm text-[#6B7280]">{email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#22C55E] text-sm font-medium">
                  <Check size={16} />
                  Connected
                </div>
              </div>
            </div>

            {/* Connect additional Gmail — Coming Soon */}
            <button
              disabled
              className="w-full p-5 rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between opacity-60 cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center">
                  <Plus className="text-[#9CA3AF]" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-[#111827]">Connect another Gmail</h3>
                  <p className="text-sm text-[#9CA3AF]">Scan subscriptions from multiple Gmail accounts</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#F97316] bg-[#F97316]/10 px-3 py-1 rounded-full uppercase tracking-wider">Coming Soon</span>
            </button>

            {/* Outlook — Coming Soon */}
            <button
              disabled
              className="w-full p-5 rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between opacity-60 cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <div className="w-5 h-5 rounded bg-blue-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-[#111827]">Outlook / Microsoft 365</h3>
                  <p className="text-sm text-[#9CA3AF]">Support for Outlook coming in a future update</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#F97316] bg-[#F97316]/10 px-3 py-1 rounded-full uppercase tracking-wider">Coming Soon</span>
            </button>

            {/* Apple Mail — Coming Soon */}
            <button
              disabled
              className="w-full p-5 rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between opacity-60 cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <div className="w-5 h-5 rounded bg-gray-800" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-[#111827]">Apple Mail / iCloud</h3>
                  <p className="text-sm text-[#9CA3AF]">Support for Apple Mail coming in a future update</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#F97316] bg-[#F97316]/10 px-3 py-1 rounded-full uppercase tracking-wider">Coming Soon</span>
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-[#FFF5F0] border border-[#F97316]/10 rounded-2xl p-4 flex gap-3">
            <Info className="text-[#F97316] flex-shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="font-semibold text-[#111827] text-sm mb-1">How does email scanning work?</h4>
              <p className="text-xs text-[#6B7280]">
                Snipcat securely reads your billing emails to detect subscriptions. We only read — never send or delete. Your data is encrypted and never shared.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Plan & Billing */}
        <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB]">
          <h2 className="text-2xl font-bold text-[#111827] mb-6">Plan & Billing</h2>

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white mb-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-2xl font-bold capitalize">{profile?.plan || 'Free'} Plan</h3>
                <p className="text-gray-300 text-sm mt-1">
                  {profile?.plan === 'pro' ? '$4.99/month' : 'Free forever'}
                </p>
              </div>
              <span className="bg-[#22C55E] text-white text-xs font-semibold px-3 py-1 rounded-full">
                Current
              </span>
            </div>
          </div>

          {profile?.plan !== 'pro' && (
            <button className="w-full py-3 bg-[#F97316] text-white rounded-full font-semibold hover:bg-[#EA580C] transition-colors">
              Upgrade to Pro
            </button>
          )}
        </div>

        {/* Section 4: Data & Privacy */}
        <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB]">
          <h2 className="text-2xl font-bold text-[#111827] mb-6">Data & Privacy</h2>

          {/* Export */}
          <div className="mb-8 pb-8 border-b border-[#E5E7EB]">
            <h3 className="text-lg font-semibold text-[#111827] mb-2">Export Your Data</h3>
            <p className="text-[#6B7280] mb-4">Download all your subscription data as CSV.</p>
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="px-5 py-2 bg-[#F97316] text-white rounded-full font-semibold hover:bg-[#EA580C] transition-colors disabled:opacity-50 shadow-[0_4px_16px_rgba(249,115,22,0.3)]"
            >
              {exporting ? 'Exporting...' : 'Export as CSV'}
            </button>
          </div>

          {/* Analytics */}
          <div className="mb-8 pb-8 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#111827]">Usage Analytics</h3>
                <p className="text-[#6B7280] text-sm mt-1">Help us improve by sharing anonymous usage data.</p>
              </div>
              <button
                onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                  analyticsEnabled ? 'bg-[#F97316]' : 'bg-[#E5E7EB]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${analyticsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Delete Account */}
          <div>
            <h3 className="text-lg font-semibold text-[#EF4444] mb-2">Delete Account</h3>
            <p className="text-[#6B7280] mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-4 py-2 bg-[#EF4444] text-white rounded-full font-semibold hover:bg-red-600 transition-colors">
              Delete Account
            </button>
          </div>
        </div>

        {/* Section 5: Appearance */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-[#E5E7EB]">
          <h2 className="text-2xl font-bold text-[#111827] mb-2">Appearance</h2>
          <p className="text-[#6B7280] mb-6">Choose your preferred color scheme.</p>

          <div className="flex gap-3">
            {['light', 'dark', 'system'].map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-4 py-2 rounded-full font-semibold transition-all capitalize ${
                  theme === t
                    ? 'bg-[#111827] text-white'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
