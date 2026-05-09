import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Loader from '../common/Loader'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) return <Loader fullPage />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default ProtectedRoute