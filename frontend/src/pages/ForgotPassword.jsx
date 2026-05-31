import { useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../components/common/Alert'
import { validateEmail } from '../utils/validators'
import api from '../services/api' // Assuming api is configured in services

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const emailV = validateEmail(email)
    if (!emailV.valid) {
      setError(emailV.message)
      return
    }
    
    setError('')
    
    try {
      setLoading(true)
      const res = await api.post('/auth/forgot-password', { email })
      setSuccess(true)
      setAlert({ type: 'success', message: res.data?.message || 'Password reset email sent.' })
    } catch (err) {
      setAlert({ 
        type: 'error', 
        message: err.response?.data?.message || 'Something went wrong. Please try again later.' 
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">Enter your email to receive a reset link</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6 dark:bg-gray-800 dark:border-gray-700">
          {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
          
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all dark:bg-gray-700 dark:text-white ${error ? 'border-red-400 bg-red-50 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30'}`}
                  placeholder="you@example.com" 
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm transition-colors shadow-sm"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Check your email inbox for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
              </p>
              <button 
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                  setAlert(null);
                }}
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium text-sm"
              >
                Try a different email
              </button>
            </div>
          )}
          
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
