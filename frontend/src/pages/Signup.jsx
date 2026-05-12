import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import SignupForm from '../components/auth/SignupForm'
import GoogleLogin from '../components/auth/GoogleLogin'
import useAuth from '../hooks/useAuth'

const Signup = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  
  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }) }, [isAuthenticated, navigate, from])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500 text-sm mt-1">Join SmartWaste and make a difference</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
          <SignupForm />
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <GoogleLogin label="Sign up with Google" />
        </div>
      </div>
    </div>
  )
}

export default Signup