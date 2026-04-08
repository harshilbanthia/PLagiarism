import { Menu } from '@headlessui/react'
import { Menu as MenuIcon, Bell, ChevronDown } from 'lucide-react'

interface NavbarProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-4 shrink-0">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        aria-label="Toggle sidebar"
      >
        <MenuIcon size={20} />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold gradient-text">PLagiarism</span>
        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 border border-cyan-500/30">
          AI
        </span>
      </div>

      <div className="flex-1" />

      {/* Notification bell */}
      <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full" />
      </button>

      {/* User menu */}
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-800 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
            U
          </div>
          <span className="text-sm text-gray-300 group-hover:text-white hidden sm:block">User</span>
          <ChevronDown size={14} className="text-gray-500 hidden sm:block" />
        </Menu.Button>

        <Menu.Items className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl shadow-black/50 py-1 z-50 focus:outline-none">
          {[
            { label: 'Profile' },
            { label: 'Settings' },
            { label: 'Sign out' },
          ].map(({ label }) => (
            <Menu.Item key={label}>
              {({ active }) => (
                <button
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    active ? 'bg-gray-700 text-white' : 'text-gray-300'
                  }`}
                >
                  {label}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Menu>
    </header>
  )
}
