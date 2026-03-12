import React, { useState } from 'react';
import { Filter, Plus, AlertTriangle, Bell } from 'lucide-react';

const Reminders = () => {
  const [prefs, setPrefs] = useState({
    renewalReminder: true,
    renewalDays: '3 days before',
    priceChange: true,
    trialWarning: true,
    weeklyDigest: false,
    digestDay: 'Every Monday',
    emailNotif: true,
  });

  const weeklyReminders = [
    {
      day: 12,
      label: 'Today — Mar 12',
      urgent: true,
      items: [
        {
          name: 'Claude MAX',
          initial: 'C',
          color: 'bg-amber-100',
          textColor: 'text-amber-700',
          daysLeft: 2,
          price: 100,
        },
      ],
    },
    {
      day: 13,
      label: 'Tomorrow — Mar 13',
      urgent: false,
      items: [],
    },
    {
      day: 15,
      label: 'Saturday — Mar 15',
      urgent: false,
      items: [
        {
          name: 'Spotify',
          initial: 'S',
          color: 'bg-green-100',
          textColor: 'text-green-600',
          daysLeft: 3,
          price: 16.99,
        },
      ],
    },
    {
      day: 18,
      label: 'Tuesday — Mar 18',
      urgent: false,
      items: [
        {
          name: 'Netflix',
          initial: 'N',
          color: 'bg-red-100',
          textColor: 'text-red-600',
          daysLeft: 6,
          price: 22.99,
        },
      ],
    },
  ];

  const laterItems = [
    {
      name: 'ChatGPT Plus',
      initial: 'G',
      color: 'bg-teal-100',
      textColor: 'text-teal-600',
      date: 'Mar 22',
      price: 20,
      daysLeft: 10,
      status: 'review',
    },
    {
      name: 'GitHub Copilot',
      initial: 'G',
      color: 'bg-purple-100',
      textColor: 'text-purple-600',
      date: 'Mar 28',
      price: 10,
      daysLeft: 16,
      status: 'active',
    },
    {
      name: 'iCloud+',
      initial: 'i',
      color: 'bg-sky-100',
      textColor: 'text-sky-600',
      date: 'Mar 30',
      price: 2.99,
      daysLeft: 18,
      status: 'active',
    },
  ];

  const togglePref = (key) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const updateDropdown = (key, value) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getCircleColor = (entry) => {
    if (entry.urgent) return 'bg-red-500';
    if (entry.day === 13) return 'bg-[#F97316]';
    if (entry.items.length > 0) return 'bg-amber-100';
    return 'bg-gray-100';
  };

  const getCircleTextColor = (entry) => {
    if (entry.urgent) return 'text-white';
    if (entry.day === 13) return 'text-white';
    return 'text-gray-700';
  };

  const getUrgencyColor = (daysLeft) => {
    if (daysLeft <= 2) return 'text-red-600';
    if (daysLeft <= 5) return 'text-amber-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Reminders</h1>
              <p className="text-gray-600">
                Never miss a renewal or free trial ending again.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2">
              <Filter size={18} />
              Filter
            </button>
            <button className="px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-orange-600 font-medium flex items-center gap-2">
              <Plus size={18} />
              New Reminder
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Section 1: Upcoming This Week */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Upcoming This Week</h2>
          <div className="space-y-8">
            {weeklyReminders.map((entry, idx) => (
              <div key={idx} className="flex gap-6">
                {/* Left: Timeline Circle and Line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full ${getCircleColor(entry)} flex items-center justify-center font-bold ${getCircleTextColor(entry)}`}
                  >
                    {entry.day}
                  </div>
                  {idx < weeklyReminders.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                  )}
                </div>

                {/* Right: Content */}
                <div className="flex-1 pt-1">
                  <p className="font-semibold text-gray-900 mb-3">{entry.label}</p>

                  {entry.items.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600">
                      No renewals tomorrow. You're good!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {entry.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className={`rounded-lg p-4 border ${
                            entry.urgent
                              ? 'bg-red-50 border-red-200'
                              : 'bg-white border-gray-100 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full ${item.color} ${item.textColor} flex items-center justify-center font-semibold text-sm`}
                              >
                                {item.initial}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {item.name}
                                </p>
                                <p className={`text-sm font-medium ${getUrgencyColor(item.daysLeft)}`}>
                                  Renews in {item.daysLeft} day{item.daysLeft !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <p className="font-semibold text-gray-900">${item.price}</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                              Snooze
                            </button>
                            <button className="px-3 py-1.5 bg-[#F97316] text-white rounded-lg text-sm font-medium hover:bg-orange-600">
                              Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Later This Month */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Later This Month</h2>
          <div className="grid gap-4">
            {laterItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full ${item.color} ${item.textColor} flex items-center justify-center font-semibold text-lg`}
                    >
                      {item.initial}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">${item.price}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">
                    Renews in {item.daysLeft} days
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'review'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {item.status === 'review' ? 'Needs Review' : 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Free Trial Ending Soon */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <AlertTriangle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <p className="text-lg font-bold text-gray-900 mb-1">
                  Figma — Professional Trial
                </p>
                <p className="text-gray-700 mb-6">
                  Your free trial ends in 3 days. After that, you'll be charged
                  $15.00/mo.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2.5 border border-orange-300 text-orange-700 rounded-lg font-medium hover:bg-orange-50">
                Cancel Before Charge
              </button>
              <button className="px-6 py-2.5 bg-[#F97316] text-white rounded-lg font-medium hover:bg-orange-600">
                Keep & Subscribe
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: Notification Preferences */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Notification Preferences
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Setting 1: Renewal Reminders */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Renewal Reminders</p>
                <p className="text-sm text-gray-600">
                  Get notified before your subscriptions renew
                </p>
              </div>
              <div className="flex items-center gap-4 ml-6">
                <select
                  value={prefs.renewalDays}
                  onChange={(e) => updateDropdown('renewalDays', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                >
                  <option>3 days before</option>
                  <option>1 day before</option>
                  <option>7 days before</option>
                  <option>Same day</option>
                </select>
                <Toggle
                  enabled={prefs.renewalReminder}
                  onChange={() => togglePref('renewalReminder')}
                />
              </div>
            </div>

            {/* Setting 2: Price Change Alerts */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Price Change Alerts</p>
                <p className="text-sm text-gray-600">
                  Be notified when a subscription price increases
                </p>
              </div>
              <div className="ml-6">
                <Toggle
                  enabled={prefs.priceChange}
                  onChange={() => togglePref('priceChange')}
                />
              </div>
            </div>

            {/* Setting 3: Free Trial Warnings */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Free Trial Warnings</p>
                <p className="text-sm text-gray-600">
                  Get alerted when your free trial is about to end
                </p>
              </div>
              <div className="ml-6">
                <Toggle
                  enabled={prefs.trialWarning}
                  onChange={() => togglePref('trialWarning')}
                />
              </div>
            </div>

            {/* Setting 4: Weekly Spending Digest */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Weekly Spending Digest</p>
                <p className="text-sm text-gray-600">
                  Receive a summary of your subscription expenses
                </p>
              </div>
              <div className="flex items-center gap-4 ml-6">
                <select
                  value={prefs.digestDay}
                  onChange={(e) => updateDropdown('digestDay', e.target.value)}
                  disabled={!prefs.weeklyDigest}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F97316] disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option>Every Monday</option>
                  <option>Every Friday</option>
                  <option>1st of Month</option>
                </select>
                <Toggle
                  enabled={prefs.weeklyDigest}
                  onChange={() => togglePref('weeklyDigest')}
                />
              </div>
            </div>

            {/* Setting 5: Email Notifications */}
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Email Notifications</p>
                <p className="text-sm text-gray-600">
                  Receive reminders via email at fengxycz@gmail.com
                </p>
              </div>
              <div className="ml-6">
                <Toggle
                  enabled={prefs.emailNotif}
                  onChange={() => togglePref('emailNotif')}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// Toggle Component
const Toggle = ({ enabled, onChange }) => {
  return (
    <div
      onClick={onChange}
      className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${
        enabled ? 'bg-[#F97316]' : 'bg-gray-200'
      } flex items-center p-0.5`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
  );
};

export default Reminders;
