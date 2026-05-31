import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
        setAlert({ type: 'error', message: err.response?.data?.message || 'Login failed. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`}
          placeholder="you@example.com" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <Link to="/forgot-password" className="text-xs text-green-600 hover:text-green-700 font-medium">Forgot Password?</Link>
        </div>
        <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`}
          placeholder="••••••••" />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm transition-colors shadow-sm">
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      {!isAdmin && (
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-green-600 hover:text-green-700 font-medium">Sign Up</Link>
        </p>
      )}
    </form>
  )
}

export default LoginForm