import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'
import useAuth from '../hooks/useAuth'

const AdminLogin = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [authError, setAuthError] = useState('')
  
  useEffect(() => { 
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        // If a normal user logs in here, log them out and show error
        logout()
        setAuthError('Access denied. Administrator privileges required.')
      }
    } 
  }, [isAuthenticated, user, navigate, logout])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center py-12 px-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700 shadow-lg">
            <svg className="w-7 h-7 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Administrator Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Authorized personnel only</p>
        </div>

        {authError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-500/50 rounded-xl text-red-600 dark:text-red-200 text-sm text-center">
            {authError}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-2xl p-8 space-y-6">
          <LoginForm isAdmin={true} />
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
