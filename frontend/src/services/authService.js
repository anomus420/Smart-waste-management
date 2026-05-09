import api from './api'

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },

  signup: async (name, email, password) => {
    const { data } = await api.post('/auth/signup', { name, email, password })
    return data
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me')
    return data
  },

  changePassword: async (currentPassword, newPassword) => {
    const { data } = await api.put('/auth/change-password', { currentPassword, newPassword })
    return data
  },

  googleLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`
  },
}