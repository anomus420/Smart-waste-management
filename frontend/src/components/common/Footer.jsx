import { Link, useLocation } from 'react-router-dom'

const Footer = () => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <footer className={`mt-auto transition-colors duration-300 ${
      isHomePage 
        ? 'bg-[#030712] text-slate-400 border-t border-white/5 rounded-t-3xl' 
        : 'bg-gray-900 text-gray-300'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isHomePage ? 'bg-gradient-to-br from-[#00ff9d] to-[#06b6d4]' : 'bg-green-600'
              }`}>
                <svg className={`w-5 h-5 ${isHomePage ? 'text-gray-950 font-bold' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">SmartWaste</span>
            </div>
            <p className="text-sm max-w-xs">
              Building cleaner, smarter communities through technology-driven waste management solutions.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[['/', 'Home'], ['/file-complaint', 'File Complaint'], ['/track-complaint', 'Track Status'], ['/ewaste', 'E-Waste Pickup']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className={`transition-colors ${isHomePage ? 'hover:text-[#00ff9d]' : 'hover:text-green-400'}`}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-sm">
              {[['/map', 'Collection Centers'], ['/awareness', 'Awareness Hub'], ['/profile', 'My Profile'], ['/admin/login', 'Admin Portal']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className={`transition-colors ${isHomePage ? 'hover:text-[#00ff9d]' : 'hover:text-green-400'}`}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={`border-t mt-8 pt-8 text-center text-sm ${isHomePage ? 'border-white/5 text-slate-650' : 'border-gray-800 text-gray-500'}`}>
          © {new Date().getFullYear()} SmartWaste Management. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer