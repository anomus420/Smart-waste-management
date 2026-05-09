import { Link } from 'react-router-dom'

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg">SmartWaste</span>
          </div>
          <p className="text-sm text-gray-400 max-w-xs">
            Building cleaner, smarter communities through technology-driven waste management solutions.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[['/', 'Home'], ['/file-complaint', 'File Complaint'], ['/track-complaint', 'Track Status'], ['/ewaste', 'E-Waste Pickup']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-green-400 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
          <ul className="space-y-2 text-sm">
            {[['/map', 'Collection Centers'], ['/awareness', 'Awareness Hub'], ['/profile', 'My Profile']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-green-400 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} SmartWaste Management. All rights reserved.
      </div>
    </div>
  </footer>
)

export default Footer