import { createContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import { getToken, setToken, setUser, getUser, clearAuth } from '../utils/storage'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(getUser())
  const [token, setTokenState] = useState(getToken())
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!token && !!user

  // On mount, verify token
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = getToken()
      if (!storedToken) {
        setLoading(false)
        return
      }
      try {
        const data = await authService.getMe()
        setUserState(data.user)
        setUser(data.user)
      } catch {
        clearAuth()
        setUserState(null)
        setTokenState(null)
      } finally {
        setLoading(false)
      }
    }
    verifyToken()
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    setToken(data.token)
    setUser(data.user)
    setTokenState(data.token)
    setUserState(data.user)
    return data
  }, [])

  const signup = useCallback(async (name, email, password) => {
    const data = await authService.signup(name, email, password)
    setToken(data.token)
    setUser(data.user)
    setTokenState(data.token)
    setUserState(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setTokenState(null)
    setUserState(null)
  }, [])

  const updateUser = useCallback((updatedUser) => {
    setUserState(updatedUser)
    setUser(updatedUser)
  }, [])

  const loginWithToken = useCallback((newToken, newUser) => {
    setToken(newToken)
    setUser(newUser)
    setTokenState(newToken)
    setUserState(newUser)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, signup, logout, updateUser, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  )
}