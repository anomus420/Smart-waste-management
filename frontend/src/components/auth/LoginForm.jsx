import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Alert from '../common/Alert'
import { validateEmail, validatePassword } from '../../utils/validators'

const LoginForm = ({ isAdmin = false }) => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const validate = () => {
    const errs = {}
    const emailV = validateEmail(form.email)
    const passV = validatePassword(form.password)
    if (!emailV.valid) errs.email = emailV.message
    if (!passV.valid) errs.password = passV.message
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      await login(form.email, form.password)
    } catch (err) {
      if (err.response?.data?.errors) {
        const backendErrors = {}
        err.response.data.errors.forEach(e => { backendErrors[e.field] = e.message })
        setErrors(backendErrors)
        setAlert({ type: 'error', message: err.response?.data?.message || 'Please fix the errors below.' })
      } else {
        setAlert({ type: 'error', message: err.response?.data?.message || 'Login failed. Please check your credentials.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
        <input 
          type="email" 
          value={form.email} 
          onChange={e => setForm({ ...form, email: e.target.value })}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all dark:bg-gray-700 dark:text-white ${
            errors.email 
              ? 'border-red-400 bg-red-50 dark:bg-red-900/30' 
              : 'border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30'
          }`}
          placeholder="you@example.com" 
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <Link to="/forgot-password" className="text-xs text-green-600 hover:text-green-500 font-medium">Forgot Password?</Link>
        </div>
        <div className="relative">
          <input 
            type={showPassword ? 'text' : 'password'} 
            value={form.password} 
            onChange={e => setForm({ ...form, password: e.target.value })}
            className={`w-full pl-4 pr-12 py-2.5 rounded-xl border text-sm outline-none transition-all dark:bg-gray-700 dark:text-white ${
              errors.password 
                ? 'border-red-400 bg-red-50 dark:bg-red-900/30' 
                : 'border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30'
            }`}
            placeholder="••••••••" 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 113.858 3.858M21 21l-2-2m-3.15-3.15L3 3m18 9c0 1.228-.27 2.393-.755 3.44A9.976 9.976 0 0112 5c-1.82 0-3.518.487-5.002 1.338" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm transition-colors shadow-sm"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      {!isAdmin && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-green-600 hover:text-green-500 font-medium">Sign Up</Link>
        </p>
      )}
    </form>
  )
}

export default LoginForm