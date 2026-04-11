import { useState, useEffect } from 'react'
import { 
  isNotificationSupported, 
  requestNotificationPermission,
  unsubscribeFromNotifications,
  isUsingFCM
} from '../utils/notificationService'
import { toast } from 'sonner'

const NotificationToggle = () => {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    // Check if device is Android
    const android = /android/i.test(navigator.userAgent)
    setIsAndroid(android)

    // Check current notification state
    const checkNotificationState = () => {
      if (android) {
        // For Android, check if FCM token exists
        const fcmToken = localStorage.getItem('fcm_token')
        setEnabled(!!fcmToken)
      } else {
        // For desktop, check Notification permission
        setEnabled(Notification.permission === 'granted')
      }
      setLoading(false)
    }

    checkNotificationState()
  }, [])

  const handleToggle = async () => {
    if (enabled) {
      // Disable notifications
      setLoading(true)
      try {
        await unsubscribeFromNotifications()
        setEnabled(false)
        toast.success(isAndroid ? 'FCM notifications disabled' : 'Notifications disabled')
      } catch (error) {
        console.error('[NOTIF] Error disabling notifications:', error)
        toast.error('Failed to disable notifications')
      } finally {
        setLoading(false)
      }
    } else {
      // Enable notifications
      setLoading(true)
      try {
        const result = await requestNotificationPermission()
        
        if (result) {
          setEnabled(true)
          toast.success(
            isAndroid 
              ? 'FCM notifications enabled! You will receive push notifications on your Android device.' 
              : 'Notifications enabled!'
          )
          
          // Send test notification for Android
          if (isAndroid) {
            setTimeout(() => {
              toast.info('Test notification sent to your device')
            }, 1000)
          }
        } else {
          toast.error('Notification permission denied')
          setEnabled(false)
        }
      } catch (error) {
        console.error('[NOTIF] Error enabling notifications:', error)
        toast.error('Failed to enable notifications')
        setEnabled(false)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">
          {isAndroid ? 'Push Notifications (FCM)' : 'Desktop Notifications'}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {isAndroid 
            ? 'Receive notifications on your Android device via Firebase Cloud Messaging'
            : 'Receive notifications on your desktop browser'}
        </p>
      </div>
      
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default NotificationToggle
