import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const features = [
  { icon: '📋', title: 'File Complaints', desc: 'Report waste issues with photos and location. Track resolution in real-time.', link: '/file-complaint', cta: 'Report Issue' },
  { icon: '♻️', title: 'E-Waste Pickup', desc: 'Schedule doorstep collection for electronics. Responsible recycling made easy.', link: '/ewaste', cta: 'Schedule Pickup' },
  { icon: '🗺️', title: 'Collection Map', desc: 'Find certified e-waste centers near you on an interactive map.', link: '/map', cta: 'View Map' },
  { icon: '📚', title: 'Awareness Hub', desc: 'Learn best practices for waste management and sustainability.', link: '/awareness', cta: 'Start Learning' },
]

const Home = () => {
  const { isAuthenticated } = useAuth()
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero */}
      <section className="bg-linear-to-br from-green-700 via-green-600 to-emerald-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            Building Cleaner Cities
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Smart Waste<br />Management
          </h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto mb-10">
            Report waste issues, schedule e-waste pickups, and contribute to a cleaner, greener community.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/file-complaint" className="px-8 py-4 rounded-xl bg-white text-green-700 font-bold text-sm hover:bg-green-50 transition-all shadow-lg hover:shadow-xl">
              File a Complaint
            </Link>
            <Link to="/ewaste" className="px-8 py-4 rounded-xl bg-white/20 backdrop-blur-sm text-white font-bold text-sm hover:bg-white/30 transition-all border border-white/30">
              Request E-Waste Pickup
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[['10,000+', 'Complaints Resolved'], ['500+', 'E-Waste Centers'], ['50,000+', 'Eco Points Earned'], ['99%', 'Satisfaction Rate']].map(([v, l]) => (
              <div key={l}>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{v}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Everything You Need</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">A comprehensive platform for modern, tech-driven waste management.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon, title, desc, link, cta }) => (
              <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">{desc}</p>
                <Link to={link} className="text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1 group-hover:gap-2 transition-all">
                  {cta} <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="bg-green-700 dark:bg-green-900 text-white py-20 transition-colors duration-200">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-green-200 dark:text-green-100 mb-8">Create a free account and start making your city cleaner today.</p>
            <Link to="/signup" className="px-8 py-4 rounded-xl bg-white text-green-700 dark:text-green-900 font-bold text-sm hover:bg-green-50 transition-all shadow-lg">
              Get Started Free
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home