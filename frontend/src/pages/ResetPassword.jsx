import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Alert from '../components/common/Alert'
import { validatePassword } from '../utils/validators'
import api from '../services/api'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const passV = validatePassword(password)
    if (!passV.valid) {
      setError(passV.message)
      return
    }
    
    setError('')
    
    try {
      setLoading(true)
      const res = await api.put(`/auth/reset-password/${token}`, { password })
      setSuccess(true)
      setAlert({ type: 'success', message: res.data?.message || 'Password reset successfully!' })
      // Optionally navigate to login after a delay
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setAlert({ 
        type: 'error', 
        message: err.response?.data?.message || 'Invalid or expired token.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 transition-colors duration-200 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set New Password</h1>
          <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">Enter your new password below</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6 dark:bg-gray-800 dark:border-gray-700">
          {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
          
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">New Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all dark:bg-gray-700 dark:text-white ${error && error.includes('Password') ? 'border-red-400 bg-red-50 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30'}`}
                  placeholder="••••••••" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all dark:bg-gray-700 dark:text-white ${error && error.includes('match') ? 'border-red-400 bg-red-50 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30'}`}
                  placeholder="••••••••" 
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm transition-colors shadow-sm"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Redirecting to login...
              </p>
              <Link 
                to="/login"
                className="inline-block py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors"
              >
                Go to Login Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
