import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Search,
  Clock,
  Settings,
  Shield,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analysis', icon: Search, label: 'Analysis' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ isOpen }: SidebarProps) {
  return (
    <aside
      className={`sidebar-transition bg-gray-900 border-r border-gray-800 flex flex-col ${
        isOpen ? 'w-56' : 'w-16'
      } shrink-0 overflow-hidden`}
    >
      {/* Brand area when sidebar collapsed shows icon */}
      <div className="h-16 flex items-center justify-center border-b border-gray-800 shrink-0">
        <Shield
          size={24}
          className="text-cyan-500 shrink-0"
          aria-label="PLagiarism logo"
        />
        {isOpen && (
          <span className="ml-2 text-sm font-semibold gradient-text whitespace-nowrap">
            PLagiarism
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={`shrink-0 ${isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-white'}`}
                />
                {isOpen && <span className="whitespace-nowrap">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-600 text-center">v1.0.0</div>
        </div>
      )}
    </aside>
  )
}
