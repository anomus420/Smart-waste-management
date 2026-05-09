import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'
import { setToken } from '../utils/storage'
import useAuth from '../hooks/useAuth'
import Loader from '../components/common/Loader'

const GoogleAuthSuccess = () => {
  const [params] = useSearchParams()
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (!token) { navigate('/login'); return }
    setToken(token)
    authService.getMe().then(data => {
      loginWithToken(token, data.user)
      navigate('/')
    }).catch(() => navigate('/login'))
  }, [])

  return <Loader fullPage />
}

export default GoogleAuthSuccess