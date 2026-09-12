import { useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import useNotification from '../../hooks/useNotification'
import { useTheme } from '../../context/ThemeContext'
import { getImageUrl } from '../../utils/formatters'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { unreadCount, notifications, markRead } = useNotification()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const isHomePage = location.pathname === '/'

  const links = [
    { to: '/', label: 'Home' },
    { to: '/file-complaint', label: 'File Complaint' },
    { to: '/track-complaint', label: 'Track' },
    { to: '/ewaste', label: 'E-Waste' },
    { to: '/map', label: 'Map' },
    { to: '/awareness', label: 'Awareness' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
    setDropdownOpen(false)
  }

  return (
    <nav className={`sticky top-0 z-40 transition-all duration-300 ${
      isHomePage 
        ? 'bg-white/80 dark:bg-[#030712]/85 backdrop-blur-md border-b border-slate-200 dark:border-white/5 shadow-md dark:shadow-2xl' 
        : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm rounded-b-3xl'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className={`flex items-center gap-2 font-bold text-lg transition-colors ${
            isHomePage ? 'text-green-700 dark:text-[#00ff9d] hover:text-green-800 dark:hover:text-[#06b6d4]' : 'text-green-700 dark:text-green-400'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              isHomePage ? 'bg-gradient-to-br from-green-500 to-[#06b6d4] dark:from-[#00ff9d] dark:to-[#06b6d4] shadow-md dark:shadow-lg dark:shadow-[#00ff9d]/20' : 'bg-green-600'
            }`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            SmartWaste
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isHomePage
                    ? isActive 
                      ? 'bg-green-500/10 dark:bg-[#00ff9d]/10 text-green-700 dark:text-[#00ff9d] border-b-2 border-green-600 dark:border-[#00ff9d] rounded-b-none' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-green-750 dark:hover:text-[#00ff9d] hover:bg-slate-50 dark:hover:bg-white/5'
                    : isActive 
                      ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle (enabled everywhere now) */}
            <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${
              isHomePage 
                ? 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-green-600 dark:hover:text-white' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}>
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markRead([]) }}
                    className={`relative p-2 rounded-lg transition-colors ${
                      isHomePage ? 'text-slate-650 dark:text-slate-300 hover:text-green-605 dark:hover:text-[#00ff9d] hover:bg-slate-100 dark:hover:bg-white/5' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border overflow-hidden z-50 ${
                      isHomePage 
                        ? 'bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 border-slate-200 dark:border-white/5' 
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="p-3 border-b border-slate-100 dark:border-white/5 font-semibold text-sm">Notifications</div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No notifications</p>
                        ) : (
                          notifications.slice(0, 10).map((n, i) => (
                            <div key={i} className={`px-4 py-3 text-sm border-b ${
                              isHomePage 
                                ? 'border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5' 
                                : 'border-gray-50 dark:border-gray-800/50 hover:bg-gray-55 dark:hover:bg-gray-800/40'
                            } ${!n.read ? 'bg-green-600/5 dark:bg-[#00ff9d]/5' : ''}`}>
                              <p className="font-medium">{n.title || n.message}</p>
                              {n.body && <p className="text-slate-500 dark:text-slate-450 text-xs mt-0.5">{n.body}</p>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User dropdown */}
                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isHomePage ? 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                    }`}>
                    {user?.avatar ? (
                      <img 
                        src={getImageUrl(user.avatar)} 
                        alt={user?.name || 'User'} 
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-white/10"
                      />
                    ) : (
                      <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center uppercase ${
                        isHomePage ? 'bg-gradient-to-r from-green-500 to-[#06b6d4] dark:from-[#00ff9d] dark:to-[#06b6d4] text-white dark:text-gray-950 font-bold' : 'bg-green-600 text-white'
                      }`}>
                        {user?.name?.[0] || 'U'}
                      </div>
                    )}
                    <span className="text-sm font-medium hidden sm:block">{user?.name?.split(' ')[0]}</span>
                    <svg className="w-4 h-4 text-gray-450" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-44 rounded-xl shadow-2xl border overflow-hidden z-50 ${
                      isHomePage 
                        ? 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-white/5 text-slate-755 dark:text-slate-200' 
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                    }`}>
                      <Link to="/profile" onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors ${
                          isHomePage ? 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-55 dark:hover:bg-gray-800'
                        }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Profile
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)}
                          className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors ${
                            isHomePage ? 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-55 dark:hover:bg-gray-800'
                          }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                          Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isHomePage ? 'text-slate-600 dark:text-slate-300 hover:text-green-700 dark:hover:text-[#00ff9d]' : 'text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400'
                }`}>Login</Link>
                <Link to="/signup" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isHomePage 
                    ? 'bg-gradient-to-r from-green-500 to-[#06b6d4] dark:from-[#00ff9d] dark:to-[#06b6d4] text-white dark:text-gray-950 font-bold hover:shadow-lg dark:hover:shadow-[#00ff9d]/30 hover:scale-[1.03]' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}>Sign Up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button className={`md:hidden p-2 rounded-lg transition-colors ${
              isHomePage ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`} onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className={`md:hidden py-3 border-t ${
            isHomePage ? 'border-slate-150 dark:border-white/5' : 'border-gray-100 dark:border-gray-800'
          }`}>
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isHomePage
                    ? isActive 
                      ? 'bg-green-500/10 dark:bg-[#00ff9d]/10 text-green-700 dark:text-[#00ff9d]' 
                      : 'text-slate-650 dark:text-slate-300 hover:bg-slate-105 dark:hover:bg-white/5'
                    : isActive 
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar