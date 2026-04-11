import { useState, useEffect } from 'react'
import { 
  requestNotificationPermission, 
  showNotification, 
  getNotificationStatus 
} from '../utils/notificationUtils'

export default function NotificationDebug() {
  const [permStatus, setPermStatus] = useState('checking')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const status = getNotificationStatus()
    setPermStatus(status)
    console.log('[NotificationDebug] Current permission:', status)
  }, [])

  const handleRequestPermission = async () => {
    console.log('[NotificationDebug] Requesting permission...')
    const result = await requestNotificationPermission()
    const newStatus = getNotificationStatus()
    setPermStatus(newStatus)
    console.log('[NotificationDebug] New status:', newStatus)
  }

  const handleTestCORS = async () => {
    console.log('[CORS Test] Testing CORS connection...')
    try {
      const response = await fetch('https://rq1hdj8s-8000.asse.devtunnels.ms/test-cors', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('[CORS Test] ✅ Success:', data)
        alert('CORS Test Successful! ✅\n' + JSON.stringify(data, null, 2))
      } else {
        console.error('[CORS Test] ❌ Failed:', response.status, response.statusText)
        alert('CORS Test Failed! ❌\nStatus: ' + response.status)
      }
    } catch (error) {
      console.error('[CORS Test] ❌ Error:', error)
      alert('CORS Test Error! ❌\n' + error.message)
    }
  }

  const statusColor = {
    'granted': 'bg-green-100 text-green-800 border-green-300',
    'denied': 'bg-red-100 text-red-800 border-red-300',
    'default': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'checking': 'bg-blue-100 text-blue-800 border-blue-300'
  }

  const statusText = {
    'granted': '✅ Diizinkan',
    'denied': '❌ Ditolak',
    'default': '⚠️ Belum Ditanyakan',
    'checking': '🔄 Mengecek...'
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg text-lg"
        title="Debug Notifikasi"
      >
        🔔
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">🔔 Debug Notifikasi</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Status */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Status Permission:
        </label>
        <div className={`p-3 rounded border-2 text-center font-semibold ${statusColor[permStatus]}`}>
          {statusText[permStatus]}
        </div>
      </div>

      {/* Help Text */}
      <div className="mb-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
        <p className="font-semibold mb-2">Cara Mengecek:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Klik button di bawah untuk request permission</li>
          <li>Allow notifikasi di pop-up browser</li>
          <li>Gunakan button "Test Notifikasi" untuk testing</li>
          <li>Buka Console (F12) untuk debug logs</li>
        </ol>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleRequestPermission}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
        >
          📢 Request Permission
        </button>

        <button
          onClick={handleTestCORS}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition"
        >
          🌐 Test CORS
        </button>

        <button
          onClick={() => {
            console.clear()
            console.log('[Console] ✅ Console cleared')
          }}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition"
        >
          🧹 Clear Console
        </button>
      </div>

      {/* Console Display */}
      <div className="mt-4 p-3 bg-gray-900 rounded text-xs text-gray-300 font-mono overflow-y-auto max-h-32">
        <p className="text-yellow-400">💡 Buka DevTools (F12) untuk melihat console logs</p>
        <p className="text-gray-400 mt-2">Lihat logs dengan prefix:</p>
        <p className="text-cyan-400">[NOTIF], [SOCKET], [INIT], [APP]</p>
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t text-xs text-gray-600">
        <p>🌐 Notifikasi browser hanya bekerja jika permission GRANTED</p>
        <p>📱 Di mobile: Allow notification saat browser minta</p>
      </div>
    </div>
  )
}
