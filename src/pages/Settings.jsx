import React, { useState } from 'react';
import { Check, Mail, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();

  // Profile section
  const [displayName, setDisplayName] = useState('CC');

  // Connected accounts section
  const [connectedAccounts, setConnectedAccounts] = useState({
    gmail: true,
    outlook: false,
    apple: false,
  });

  // Data & Privacy section
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleAccountConnect = (account) => {
    setConnectedAccounts(prev => ({
      ...prev,
      [account]: !prev[account]
    }));
  };

  const handleSaveProfile = () => {
    // In a real app, this would save to backend
    console.log('Saving profile with displayName:', displayName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account, connections, and preferences.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* Section 1: Profile */}
        <div className="bg-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>

          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-[#F97316] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-2xl font-bold">CC</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">CC</h3>
              <p className="text-gray-600">fengxycz@gmail.com</p>
              <button className="text-[#F97316] hover:text-orange-500 text-sm font-medium mt-2">
                Change avatar
              </button>
            </div>
          </div>

          {/* Profile Inputs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value="fengxycz@gmail.com"
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="px-6 py-2 bg-[#F97316] text-white rounded-lg hover:bg-orange-500 font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>

        {/* Section 2: Connected Accounts */}
        <div className="bg-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connected Accounts</h2>
          <p className="text-gray-600 mb-6">Connect your email accounts to enable smart email scanning and snippet extraction.</p>

          {/* Account Rows */}
          <div className="space-y-4 mb-6">
            {/* Gmail */}
            <div className={`p-4 rounded-lg border-2 ${
              connectedAccounts.gmail
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Mail className="text-red-500" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Gmail</h3>
                    <p className="text-sm text-gray-600">
                      {connectedAccounts.gmail ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {connectedAccounts.gmail && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <Check size={18} />
                      Connected
                    </div>
                  )}
                  <button
                    onClick={() => handleAccountConnect('gmail')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      connectedAccounts.gmail
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-[#F97316] text-white hover:bg-orange-500'
                    }`}
                  >
                    {connectedAccounts.gmail ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>

            {/* Outlook / Microsoft 365 */}
            <div className={`p-4 rounded-lg border-2 ${
              connectedAccounts.outlook
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Outlook / Microsoft 365</h3>
                    <p className="text-sm text-gray-600">
                      {connectedAccounts.outlook ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {connectedAccounts.outlook && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <Check size={18} />
                      Connected
                    </div>
                  )}
                  <button
                    onClick={() => handleAccountConnect('outlook')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      connectedAccounts.outlook
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-[#F97316] text-white hover:bg-orange-500'
                    }`}
                  >
                    {connectedAccounts.outlook ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>

            {/* Apple Mail / iCloud */}
            <div className={`p-4 rounded-lg border-2 ${
              connectedAccounts.apple
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded bg-gray-800"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Apple Mail / iCloud</h3>
                    <p className="text-sm text-gray-600">
                      {connectedAccounts.apple ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {connectedAccounts.apple && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <Check size={18} />
                      Connected
                    </div>
                  )}
                  <button
                    onClick={() => handleAccountConnect('apple')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      connectedAccounts.apple
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-[#F97316] text-white hover:bg-orange-500'
                    }`}
                  >
                    {connectedAccounts.apple ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="text-blue-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">How does email scanning work?</h4>
              <p className="text-sm text-blue-800">
                When you connect your email account, SnipKitty securely scans your emails to automatically extract and organize important snippets, code blocks, and references. Your data is encrypted and never shared with third parties.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Plan & Billing */}
        <div className="bg-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Plan & Billing</h2>

          {/* Pro Plan Banner */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 text-white mb-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-2xl font-bold">Pro Plan</h3>
                <p className="text-gray-300 text-sm mt-1">$4.99/month</p>
              </div>
              <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Current
              </span>
            </div>
            <p className="text-gray-300 text-sm">Next billing date: April 1, 2026</p>
          </div>

          {/* Billing Info Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Payment Method */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Method</h3>
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 text-white mb-3">
                <p className="text-sm font-medium mb-2">VISA</p>
                <p className="text-lg font-semibold">**** 4242</p>
              </div>
              <button className="text-[#F97316] hover:text-orange-500 text-sm font-medium">
                Update
              </button>
            </div>

            {/* Billing History */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Billing History</h3>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">March 12, 2026</span>
                  <span className="font-medium text-gray-900">$4.99</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">February 12, 2026</span>
                  <span className="font-medium text-gray-900">$4.99</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">January 12, 2026</span>
                  <span className="font-medium text-gray-900">$4.99</span>
                </div>
              </div>
              <button className="text-[#F97316] hover:text-orange-500 text-sm font-medium">
                View all
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Data & Privacy */}
        <div className="bg-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Data & Privacy</h2>

          {/* Export Your Data */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Your Data</h3>
            <p className="text-gray-600 mb-4">Download all your subscription data as CSV or JSON.</p>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-orange-500 font-medium transition-colors">
                CSV
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition-colors">
                JSON
              </button>
            </div>
          </div>

          {/* Usage Analytics */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Usage Analytics</h3>
                <p className="text-gray-600 text-sm mt-1">Help us improve by sharing anonymous usage data.</p>
              </div>
              <button
                onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                className={`w-11 h-6 rounded-full transition-colors ${
                  analyticsEnabled ? 'bg-[#F97316]' : 'bg-gray-200'
                }`}
              />
            </div>
          </div>

          {/* Delete Account */}
          <div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors">
              Delete Account
            </button>
          </div>
        </div>

        {/* Section 5: Appearance */}
        <div className="bg-white rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Appearance</h2>
          <p className="text-gray-600 mb-6">Choose your preferred color scheme.</p>

          {/* Theme Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                theme === 'light'
                  ? 'bg-white text-gray-900 shadow-sm font-semibold border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-white text-gray-900 shadow-sm font-semibold border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                theme === 'system'
                  ? 'bg-white text-gray-900 shadow-sm font-semibold border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              System
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
