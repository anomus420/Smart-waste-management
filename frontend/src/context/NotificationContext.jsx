import { createContext, useState, useCallback } from 'react'
import api from '../services/api'
import useAutoRefresh from '../hooks/useAutoRefresh'
import useAuth from '../hooks/useAuth'

export const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      setLoading(true)
      const { data } = await api.get('/users/notifications?limit=20')
      setNotifications(data.notifications || [])
      setUnreadCount((data.notifications || []).filter(n => !n.read).length)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useAutoRefresh(fetchNotifications, 30000, isAuthenticated)

  const markRead = useCallback(async (ids = []) => {
    try {
      await api.put('/users/notifications/read', { ids })
      await fetchNotifications()
    } catch {}
  }, [fetchNotifications])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, markRead, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}