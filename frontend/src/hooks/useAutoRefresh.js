import { useEffect, useRef } from 'react'

const useAutoRefresh = (callback, intervalMs = 30000, enabled = true) => {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    callbackRef.current()

    const interval = setInterval(() => {
      callbackRef.current()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [intervalMs, enabled])
}

export default useAutoRefresh