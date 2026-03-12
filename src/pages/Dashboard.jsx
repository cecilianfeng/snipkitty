import React, { useState } from 'react';
import {
  DollarSign,
  Package,
  Clock,
  TrendingDown,
  Download,
  Mail,
  Filter,
  ChevronDown,
} from 'lucide-react';

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('renewal');
  const [hoveredId, setHoveredId] = useState(null);

  const subscriptions = [
    {
      id: 1,
      name: 'Claude MAX',
      provider: 'Anthropic',
      price: 100,
      cycle: 'Monthly',
      renewal: 'Mar 14',
      status: 'active',
      color: 'bg-amber-100',
      textColor: 'text-amber-700',
      initial: 'C',
    },
    {
      id: 2,
      name: 'Cursor',
      provider: 'MAX Plan',
      price: 200,
      cycle: 'Monthly',
      renewal: 'Apr 5',
      status: 'review',
      color: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      initial: 'C',
    },
    {
      id: 3,
      name: 'Netflix',
      provider: 'Premium Plan',
      price: 22.99,
      cycle: 'Monthly',
      renewal: 'Mar 18',
      status: 'active',
      color: 'bg-red-100',
      textColor: 'text-red-600',
      initial: 'N',
    },
    {
      id: 4,
      name: 'Spotify',
      provider: 'Family Plan',
      price: 16.99,
      cycle: 'Monthly',
      renewal: 'Mar 15',
      status: 'active',
      color: 'bg-green-100',
      textColor: 'text-green-600',
      initial: 'S',
    },
    {
      id: 5,
      name: 'ChatGPT Plus',
      provider: 'Individual',
      price: 20,
      cycle: 'Monthly',
      renewal: 'Mar 22',
      status: 'active',
      color: 'bg-teal-100',
      textColor: 'text-teal-600',
      initial: 'G',
    },
    {
      id: 6,
      name: 'Notion',
      provider: 'Plus Plan',
      price: 10,
      cycle: 'Monthly',
      renewal: 'Apr 1',
      status: 'active',
      color: 'bg-gray-100',
      textColor: 'text-gray-700',
      initial: 'N',
    },
    {
      id: 7,
      name: 'GitHub Copilot',
      provider: 'Individual',
      price: 10,
      cycle: 'Monthly',
      renewal: 'Mar 28',
      status: 'active',
      color: 'bg-purple-100',
      textColor: 'text-purple-600',
      initial: 'G',
    },
    {
      id: 8,
      name: 'iCloud+',
      provider: '200GB',
      price: 2.99,
      cycle: 'Monthly',
      renewal: 'Mar 30',
      status: 'active',
      color: 'bg-sky-100',
      textColor: 'text-sky-600',
      initial: 'i',
    },
    {
      id: 9,
      name: 'Adobe Creative Cloud',
      provider: 'All Apps',
      price: 54.99,
      cycle: 'Monthly',
      renewal: '',
      status: 'cancelled',
      color: 'bg-red-100',
      textColor: 'text-red-400',
      initial: 'A',
    },
  ];

  // Filter subscriptions based on activeFilter
  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (activeFilter === 'all') return true;
    return sub.status === activeFilter;
  });

  // Sort subscriptions
  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    if (sortBy === 'renewal') {
      // Sort by renewal date (cancelled items go to bottom)
      if (a.status === 'cancelled' && b.status !== 'cancelled') return 1;
      if (a.status !== 'cancelled' && b.status === 'cancelled') return -1;
      if (a.status === 'cancelled' && b.status === 'cancelled') return 0;

      const dateA = new Date(a.renewal.replace('Apr', 'Apr').replace('Mar', 'Mar'));
      const dateB = new Date(b.renewal.replace('Apr', 'Apr').replace('Mar', 'Mar'));
      return dateA - dateB;
    } else if (sortBy === 'price') {
      return b.price - a.price;
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const getFilterCounts = () => {
    return {
      all: subscriptions.length,
      active: subscriptions.filter((s) => s.status === 'active').length,
      review: subscriptions.filter((s) => s.status === 'review').length,
      cancelled: subscriptions.filter((s) => s.status === 'cancelled').length,
    };
  };

  const counts = getFilterCounts();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
            Active
          </span>
        );
      case 'review':
        return (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
            Review
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Your subscription overview at a glance.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium">
              <Mail className="w-4 h-4" />
              Scan Inbox
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Monthly Cost */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Monthly Cost</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">$127.50</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Renewing Soon */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Renewing Soon</p>
                <p className="text-3xl font-bold text-orange-500 mt-2">3</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Saved This Month */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Saved This Month</p>
                <p className="text-3xl font-bold text-green-600 mt-2">$47.00</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All', count: counts.all },
              { key: 'active', label: 'Active', count: counts.active },
              { key: 'review', label: 'Review', count: counts.review },
              { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                  activeFilter === filter.key
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 cursor-pointer appearance-none pr-8 hover:bg-gray-200 transition-colors"
            >
              <option value="renewal">Sort: Renewal Date</option>
              <option value="price">Sort: Price (High to Low)</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" />
          </div>
        </div>

        {/* Subscription List */}
        <div className="space-y-3">
          {sortedSubscriptions.length > 0 ? (
            sortedSubscriptions.map((sub) => (
              <div
                key={sub.id}
                onMouseEnter={() => setHoveredId(sub.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`bg-white rounded-xl border border-gray-200 p-5 flex justify-between items-center transition-all ${
                  sub.status === 'cancelled' ? 'opacity-50' : ''
                }`}
              >
                {/* Left Section */}
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-full ${sub.color} ${sub.textColor} flex items-center justify-center font-bold text-lg flex-shrink-0`}
                  >
                    {sub.initial}
                  </div>
                  <div>
                    <p
                      className={`font-semibold text-gray-900 ${
                        sub.status === 'cancelled' ? 'line-through text-gray-500' : ''
                      }`}
                    >
                      {sub.name}
                    </p>
                    <p className="text-sm text-gray-600">{sub.provider}</p>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-6">
                  {sub.status !== 'cancelled' && sub.renewal && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Next renewal</p>
                      <p className="font-semibold text-gray-900">{sub.renewal}</p>
                    </div>
                  )}
                  {sub.status === 'cancelled' && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Cancelled</p>
                      <p className="font-semibold text-gray-500">—</p>
                    </div>
                  )}

                  <div className="text-right min-w-20">
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-semibold text-gray-900">
                      ${sub.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="min-w-32">{getStatusBadge(sub.status)}</div>

                  {/* Action Buttons (shown on hover) */}
                  {hoveredId === sub.id && (
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-lg hover:bg-green-200 transition-colors whitespace-nowrap">
                        Keep
                      </button>
                      <button className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-lg hover:bg-orange-200 transition-colors whitespace-nowrap">
                        Review
                      </button>
                      <button className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors whitespace-nowrap">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-600 font-medium">No subscriptions found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
