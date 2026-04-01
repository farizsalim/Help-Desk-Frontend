import { useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'

/**
 * Notification Permission Banner Component
 * Shows a banner asking user to enable browser notifications
 */
export const NotificationBanner = () => {
  const { isSupported, isGranted, permission, requestPermission } = useNotifications()
  const [dismissed, setDismissed] = useState(false)

  if (!isSupported || isGranted || dismissed) return null

  const handleEnableNotifications = async () => {
    await requestPermission()
  }

  const handleDismiss = () => {
    setDismissed(true)
  }

  const isDenied = permission === 'denied'

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-medium text-blue-900">Aktifkan Notifikasi</h3>
          <p className="text-sm text-blue-800 mt-1">
            {isDenied
              ? 'Notifikasi browser diblokir. Untuk pengalaman real-time seperti WhatsApp, aktifkan notifikasi di pengaturan browser (ikon gembok di URL bar).'
              : 'Izinkan notifikasi browser untuk menerima update pesan dan tiket secara real-time.'}
          </p>
        </div>
        <div className="flex gap-2">
          {!isDenied && (
            <button
              onClick={handleEnableNotifications}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              Aktifkan
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="px-3 py-2 bg-transparent hover:bg-blue-100 text-blue-700 text-sm rounded transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
