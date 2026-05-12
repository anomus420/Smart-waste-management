import axios from 'axios'
import { getToken, clearAuth } from '../utils/storage'

let apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Automatically append /api if the user forgot it in their environment variable
if (!apiBaseURL.endsWith('/api')) {
  apiBaseURL = apiBaseURL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api