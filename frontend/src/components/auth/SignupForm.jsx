import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Alert from '../common/Alert'
import { validateEmail, validatePassword, validateRequired } from '../../utils/validators'

const SignupForm = () => {
  const { signup } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      
      {fields.map(({ key, label, type, placeholder }) => {
        const isPasswordField = key === 'password' || key === 'confirmPassword'
        const isShowPass = key === 'password' ? showPassword : showConfirmPassword
        const toggleShowPass = key === 'password' ? () => setShowPassword(!showPassword) : () => setShowConfirmPassword(!showConfirmPassword)
        const inputType = isPasswordField ? (isShowPass ? 'text' : 'password') : type

        return (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
            <div className="relative">
              <input 
                type={inputType} 
                value={form[key]} 
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all dark:bg-gray-700 dark:text-white ${
                  isPasswordField ? 'pr-12' : ''
                } ${errors[key] ? 'border-red-400 bg-red-50 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30'}`}
                placeholder={placeholder} 
              />
              {isPasswordField && (
                <button
                  type="button"
                  onClick={toggleShowPass}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                >
                  {isShowPass ? (
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
              )}
            </div>
            {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
          </div>
        )
      })}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm transition-colors shadow-sm"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-green-600 hover:text-green-500 font-medium">Sign In</Link>
      </p>
    </form>
  )
}

export default SignupForm