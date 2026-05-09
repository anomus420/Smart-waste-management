import { Link } from 'react-router-dom'

const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="text-center">
      <div className="text-8xl font-bold text-green-600 mb-4">404</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors">
        Go Home
      </Link>
    </div>
  </div>
)

export default NotFound