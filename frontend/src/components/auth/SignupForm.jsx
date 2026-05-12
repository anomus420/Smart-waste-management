import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Alert from '../common/Alert'
import { validateEmail, validatePassword, validateRequired } from '../../utils/validators'

const SignupForm = () => {
  const { signup } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)

  const validate = () => {
    const errs = {}
    const nameV = validateRequired(form.name, 'Name')
    const emailV = validateEmail(form.email)
    const passV = validatePassword(form.password)
    if (!nameV.valid) errs.name = nameV.message
    if (!emailV.valid) errs.email = emailV.message
    if (!passV.valid) errs.password = passV.message
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      await signup(form.name, form.email, form.password)
    } catch (err) {
      if (err.response?.data?.errors) {
        const backendErrors = {}
        err.response.data.errors.forEach(e => { backendErrors[e.field] = e.message })
        setErrors(backendErrors)
        setAlert({ type: 'error', message: err.response?.data?.message || 'Please fix the errors below.' })
      } else {
        setAlert({ type: 'error', message: err.response?.data?.message || 'Signup failed. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
    { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    { key: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      {fields.map(({ key, label, type, placeholder }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
          <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`}
            placeholder={placeholder} />
          {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
        </div>
      ))}
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm transition-colors shadow-sm">
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">Sign In</Link>
      </p>
    </form>
  )
}

export default SignupForm