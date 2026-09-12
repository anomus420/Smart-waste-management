import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'
import { setToken } from '../utils/storage'
import useAuth from '../hooks/useAuth'
import Loader from '../components/common/Loader'

const GoogleAuthSuccess = () => {
  const [params] = useSearchParams()
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()
  const processingRef = useRef(false)

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    if (processingRef.current) return
    processingRef.current = true

    setToken(token)
    authService.getMe()
      .then((data) => {
        loginWithToken(token, data.user)
        navigate('/', { replace: true })
      })
      .catch((err) => {
        console.error('Google Auth Failed:', err)
        navigate('/login?error=google_failed', { replace: true })
      })
  }, [params, loginWithToken, navigate])

  return <Loader fullPage />
}

export default GoogleAuthSuccess