import React, { useState } from 'react';
import { Filter, Plus, ChevronDown, Lightbulb, Play, ClipboardCheck, Cloud, Ban } from 'lucide-react';

export default function Subscriptions() {
  const [activeView, setActiveView] = useState('by-category');
  const [expandedItems, setExpandedItems] = useState({});
  const [sortBy, setSortBy] = useState('price-high');

  const categories = [
    {
      name: 'AI Tools',
      icon: 'Lightbulb',
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
      total: 310,
      count: 3,
      items: [
        {
          name: 'Claude MAX',
          provider: 'Anthropic · Monthly',
          price: 100,
          renewal: 'Mar 14, 2026',
          status: 'active',
          color: 'bg-amber-100',
          textColor: 'text-amber-700',
          initial: 'C',
          spent1y: 1200,
          spent2y: 2400,
          spentAll: 2400,
          started: 'Mar 14, 2024',
          payment: 'Visa •••• 4242',
          priceAlert: null,
        },
        {
          name: 'Cursor',
          provider: 'MAX Plan · Monthly',
          price: 200,
          renewal: 'Apr 5, 2026',
          status: 'review',
          color: 'bg-indigo-100',
          textColor: 'text-indigo-600',
          initial: 'C',
          spent1y: 2400,
          spent2y: 3600,
          spentAll: 3600,
          started: 'Jun 10, 2024',
          payment: 'Visa •••• 4242',
          priceAlert: 'Price increased from $100 → $200 in Oct',
        },
        {
          name: 'ChatGPT Plus',
          provider: 'Individual · Monthly',
          price: 20,
          renewal: 'Mar 22, 2026',
          status: 'active',
          color: 'bg-teal-100',
          textColor: 'text-teal-600',
          initial: 'G',
          spent1y: 240,
          spent2y: 480,
          spentAll: 480,
          started: 'Mar 22, 2024',
          payment: 'Visa •••• 4242',
          priceAlert: null,
        },
      ],
    },
    {
      name: 'Entertainment',
      icon: 'Play',
      color: 'bg-red-100',
      iconColor: 'text-red-500',
      total: 39.98,
      count: 2,
      items: [
        {
          name: 'Netflix',
          provider: 'Premium Plan · Monthly',
          price: 22.99,
          renewal: 'Mar 18, 2026',
          status: 'active',
          color: 'bg-red-100',
          textColor: 'text-red-600',
          initial: 'N',
          spent1y: 275.88,
          spent2y: 527.76,
          spentAll: 827.64,
          started: 'Jan 5, 2023',
          payment: 'Visa •••• 4242',
          priceAlert: 'Price went up: $15.99 → $22.99 in Oct',
        },
        {
          name: 'Spotify',
          provider: 'Family Plan · Monthly',
          price: 16.99,
          renewal: 'Mar 15, 2026',
          status: 'active',
          color: 'bg-green-100',
          textColor: 'text-green-600',
          initial: 'S',
          spent1y: 203.88,
          spent2y: null,
          spentAll: 611.64,
          started: 'Aug 1, 2023',
          payment: 'Visa •••• 4242',
          priceAlert: null,
        },
      ],
    },
    {
      name: 'Productivity',
      icon: 'ClipboardCheck',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      total: 20,
      count: 2,
      items: [
        {
          name: 'Notion',
          provider: 'Plus Plan · Monthly',
          price: 10,
          renewal: 'Apr 1, 2026',
          status: 'active',
          color: 'bg-gray-100',
          textColor: 'text-gray-700',
          initial: 'N',
          spent1y: 120,
          spent2y: 240,
          spentAll: 240,
          started: 'Apr 1, 2024',
          payment: 'Visa •••• 4242',
          priceAlert: null,
        },
        {
          name: 'GitHub Copilot',
          provider: 'Individual · Monthly',
          price: 10,
          renewal: 'Mar 28, 2026',
          status: 'active',
          color: 'bg-purple-100',
          textColor: 'text-purple-600',
          initial: 'G',
          spent1y: 120,
          spent2y: 120,
          spentAll: 120,
          started: 'Mar 28, 2025',
          payment: 'Visa •••• 4242',
          priceAlert: null,
        },
      ],
    },
    {
      name: 'Cloud Storage',
      icon: 'Cloud',
      color: 'bg-sky-100',
      iconColor: 'text-sky-600',
      total: 2.99,
      count: 1,
      items: [
        {
          name: 'iCloud+',
          provider: '200GB · Monthly',
          price: 2.99,
          renewal: 'Mar 30, 2026',
          status: 'active',
          color: 'bg-sky-100',
          textColor: 'text-sky-600',
          initial: 'i',
          spent1y: 35.88,
          spent2y: 71.76,
          spentAll: 71.76,
          started: 'Mar 30, 2024',
          payment: 'Visa •••• 4242',
          priceAlert: null,
        },
      ],
    },
    {
      name: 'Cancelled',
      icon: 'Ban',
      color: 'bg-gray-100',
      iconColor: 'text-gray-400',
      total: 54.99,
      count: 1,
      isCancelled: true,
      items: [
        {
          name: 'Adobe Creative Cloud',
          provider: 'All Apps · Monthly',
          price: 54.99,
          renewal: 'Feb 20, 2026',
          status: 'cancelled',
          color: 'bg-red-100',
          textColor: 'text-red-400',
          initial: 'A',
          spent1y: 659.88,
          spent2y: 1319.76,
          spentAll: 1319.76,
          started: 'Feb 20, 2022',
          payment: 'Visa •••• 4242',
          priceAlert: null,
        },
      ],
    },
  ];

  const iconMap = {
    Lightbulb: Lightbulb,
    Play: Play,
    ClipboardCheck: ClipboardCheck,
    Cloud: Cloud,
    Ban: Ban,
  };

  const toggleExpanded = (itemName) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'review':
        return 'bg-orange-100 text-orange-700';
      case 'cancelled':
        return 'bg-gray-200 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'review':
        return 'Review';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getSortedItems = (items) => {
    const sorted = [...items];
    if (sortBy === 'price-high') {
      return sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'price-low') {
      return sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'renewal') {
      return sorted.sort((a, b) => new Date(a.renewal) - new Date(b.renewal));
    } else if (sortBy === 'name') {
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  };

  const renderCategoryView = () => {
    return (
      <div className="space-y-8">
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon];
          const sortedItems = getSortedItems(category.items);
          const isCancelled = category.isCancelled;

          return (
            <div key={category.name} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${category.color} ${category.iconColor} p-2 rounded-lg`}>
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600">
                      {category.count} subscription{category.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="ml-4">
                    {isCancelled ? (
                      <p className="text-sm font-medium text-green-600">
                        You saved ${category.total}/mo
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">
                        ${category.total.toFixed(2)}/mo
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Subscription Items */}
              <div className="space-y-2">
                {sortedItems.map((item) => {
                  const isExpanded = expandedItems[item.name];

                  return (
                    <div key={item.name} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Collapsed View */}
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={`w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                          isCancelled ? 'opacity-50' : ''
                        }`}
                      >
                        {/* Icon Circle */}
                        <div
                          className={`${item.color} ${item.textColor} w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0`}
                        >
                          {item.initial}
                        </div>

                        {/* Name & Provider */}
                        <div className="flex-1 text-left min-w-0">
                          <p
                            className={`font-medium text-gray-900 ${
                              isCancelled ? 'line-through text-gray-500' : ''
                            }`}
                          >
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">{item.provider}</p>
                        </div>

                        {/* Renewal Date */}
                        <div className="text-sm text-gray-600 min-w-max">
                          <p className="text-xs text-gray-500">Renews</p>
                          <p className="font-medium">{item.renewal}</p>
                        </div>

                        {/* Price */}
                        <div className="text-right min-w-max">
                          <p className="text-lg font-semibold text-gray-900">
                            ${item.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">monthly</p>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            item.status
                          )}`}
                        >
                          {getStatusText(item.status)}
                        </div>

                        {/* Chevron */}
                        <ChevronDown
                          size={20}
                          className={`text-gray-400 flex-shrink-0 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 px-5 py-6">
                          <div className="grid grid-cols-3 gap-6">
                            {/* Total Spent Panel */}
                            <div className="bg-white rounded-xl p-5">
                              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                                Total Spent
                              </h4>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Past 1 Year</p>
                                  <p className="text-xl font-bold text-gray-900">
                                    ${item.spent1y.toFixed(2)}
                                  </p>
                                </div>
                                {item.spent2y && (
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">Past 2 Years</p>
                                    <p className="text-xl font-bold text-gray-900">
                                      ${item.spent2y.toFixed(2)}
                                    </p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">All Time</p>
                                  <p className="text-xl font-bold text-gray-900">
                                    ${item.spentAll.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Monthly History Panel */}
                            <div className="bg-white rounded-xl p-5">
                              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                                Monthly History
                              </h4>
                              <div className="flex items-end gap-1 h-24 mb-4">
                                {[0.6, 0.4, 0.8, 1, 0.9, 0.7, 0.5, 0.95, 0.65, 0.85, 0.75, 1].map(
                                  (height, idx) => (
                                    <div
                                      key={idx}
                                      className="flex-1 bg-orange-400 rounded-sm"
                                      style={{ height: `${height * 100}%`, minHeight: '4px' }}
                                    />
                                  )
                                )}
                              </div>
                              {item.priceAlert && (
                                <p className="text-xs text-red-600 font-medium">{item.priceAlert}</p>
                              )}
                            </div>

                            {/* Details & Actions Panel */}
                            <div className="bg-white rounded-xl p-5">
                              <h4 className="text-sm font-semibold text-gray-900 mb-4">Details</h4>
                              <div className="space-y-3 mb-4">
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Started</p>
                                  <p className="text-sm font-medium text-gray-900">{item.started}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Billing Cycle</p>
                                  <p className="text-sm font-medium text-gray-900">Monthly</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                                  <p className="text-sm font-medium text-gray-900">{item.payment}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Status</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {getStatusText(item.status)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {item.status !== 'cancelled' && (
                                  <>
                                    {item.status === 'active' && (
                                      <button className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                        Mark as Review
                                      </button>
                                    )}
                                    <button className="flex-1 px-3 py-2 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                                      Cancel
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAllListView = () => {
    const allItems = categories.flatMap((cat) =>
      cat.items.map((item) => ({ ...item, category: cat.name }))
    );
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">All subscriptions list view - {allItems.length} total items</p>
      </div>
    );
  };

  const renderSpendingView = () => {
    const totalMonthly = categories.reduce((sum, cat) => sum + cat.total, 0);
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">
          Spending analysis - Total monthly: ${totalMonthly.toFixed(2)}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
              <p className="text-gray-600 mt-1">Manage and track all your subscriptions</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors">
                <Filter size={18} />
                Filter
              </button>
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 flex items-center gap-2 transition-colors">
                <Plus size={18} />
                Add Manually
              </button>
            </div>
          </div>

          {/* View Tabs & Sort */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {['By Category', 'All List', 'Spending'].map((tab) => {
                const viewKey = tab.toLowerCase().replace(' ', '-');
                const isActive = activeView === viewKey;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveView(viewKey)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors appearance-none cursor-pointer bg-white"
            >
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="renewal">Renewal Date</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeView === 'by-category' && renderCategoryView()}
        {activeView === 'all-list' && renderAllListView()}
        {activeView === 'spending' && renderSpendingView()}
      </div>
    </div>
  );
}
