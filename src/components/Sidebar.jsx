import { NavLink } from 'react-router-dom'
import { Home, Package, Bell, Settings } from 'lucide-react'

const CatLogo = () => (
  <svg viewBox="0 0 58 42" fill="none" className="w-9 h-7">
    <g transform="translate(8,26) scale(0.28)">
      <circle cx="-6" cy="6" r="5" stroke="#F97316" strokeWidth="3" fill="none" />
      <line x1="-4" y1="2" x2="6" y2="-10" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
      <circle cx="6" cy="6" r="5" stroke="#F97316" strokeWidth="3" fill="none" />
      <line x1="4" y1="2" x2="-6" y2="-10" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
    </g>
    <g transform="translate(18, 0)">
      <path d="M8 16L4 3L14 12" fill="white" />
      <path d="M32 16L36 3L26 12" fill="white" />
      <ellipse cx="20" cy="24" rx="14" ry="13" fill="white" />
      <ellipse cx="15" cy="22" rx="2.2" ry="2.6" fill="#F97316" />
      <ellipse cx="25" cy="22" rx="2.2" ry="2.6" fill="#F97316" />
      <path d="M18.8 27L20 28.8L21.2 27Z" fill="#F97316" />
    </g>
  </svg>
)

export default function Sidebar() {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/subscriptions', label: 'Subscriptions', icon: Package },
    { path: '/reminders', label: 'Reminders', icon: Bell },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo Section */}
      <div className="border-b border-white/10 p-6 flex items-center gap-3">
        <CatLogo />
        <h1 className="text-xl font-bold">SnipKitty</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-white/10 p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-semibold text-white text-sm">
          CC
        </div>
        <div className="flex-1">
          <p className="font-medium">CC</p>
          <p className="text-xs text-white/60">Pro Plan</p>
        </div>
      </div>
    </div>
  )
}
