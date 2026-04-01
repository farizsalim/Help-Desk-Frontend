import { useEffect, useState } from 'react'
import { requestNotificationPermission, isNotificationSupported } from '../utils/notificationService'

/**
 * Custom hook to manage notification permissions
 */
export const useNotifications = () => {
  const [notificationPermission, setNotificationPermission] = useState(
    isNotificationSupported() ? window.Notification.permission : 'denied'
  )
  const [isSupported] = useState(isNotificationSupported())

  useEffect(() => {
    if (!isSupported) return

    // Update permission state
    setNotificationPermission(window.Notification.permission)
  }, [isSupported])

  const requestPermission = async () => {
    const granted = await requestNotificationPermission()
    setNotificationPermission(granted ? 'granted' : 'denied')
    return granted
  }

  return {
    isSupported,
    permission: notificationPermission,
    requestPermission,
    isGranted: notificationPermission === 'granted'
  }
}
