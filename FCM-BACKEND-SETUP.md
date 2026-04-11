# 🔔 Setup FCM (Firebase Cloud Messaging) untuk Backend

## ✅ Yang Sudah Selesai di Frontend

1. ✅ Firebase SDK sudah terinstall
2. ✅ Service Worker (`firebase-messaging-sw.js`) sudah dibuat
3. ✅ PWA Manifest (`manifest.webmanifest`) sudah dibuat
4. ✅ Hook FCM sudah dibuat dan terintegrasi di Dashboard
5. ✅ Build berhasil

## 📋 Yang Perlu Dilakukan di Backend

### 1. Install Dependencies

```bash
npm install firebase-admin
```

### 2. Download Service Account Key

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **help-desk-ba573**
3. Pergi ke **Project Settings** (gear icon)
4. Tab **Service Accounts**
5. Klik **Generate New Private Key**
6. Simpan file JSON yang didownload sebagai `firebase-service-account.json`

### 3. Setup Firebase Admin di Backend

```javascript
// Di backend (misalnya: src/config/firebase.js)
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const messaging = admin.messaging();

module.exports = { messaging, admin };
```

### 4. Buat Endpoint untuk Save FCM Token

```javascript
// Di routes/fcm.js atau similar
const express = require('express');
const router = express.Router();
const db = require('../config/database'); // Sesuaikan dengan DB Anda
const authMiddleware = require('../middleware/auth');

// POST /fcm/save-token
router.post('/save-token', authMiddleware, async (req, res) => {
  try {
    const { fcm_token, user_id, platform } = req.body;
    
    if (!fcm_token || !user_id) {
      return res.status(400).json({ error: 'FCM token and user ID required' });
    }
    
    // Save to database
    await db.query(`
      INSERT INTO user_fcm_tokens (user_id, fcm_token, platform, created_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        fcm_token = VALUES(fcm_token),
        updated_at = NOW()
    `, [user_id, fcm_token, platform]);
    
    console.log(`[FCM] Token saved for user ${user_id}`);
    res.json({ success: true, message: 'FCM token saved successfully' });
  } catch (error) {
    console.error('[FCM] Error saving token:', error);
    res.status(500).json({ error: 'Failed to save FCM token' });
  }
});

module.exports = router;
```

### 5. Fungsi untuk Kirim Notifikasi Push

```javascript
// Di services/notificationService.js
const { messaging } = require('../config/firebase');
const db = require('../config/database');

// Kirim notifikasi ke specific user
const sendPushNotificationToUser = async (userId, title, body, data = {}) => {
  try {
    // Get user's FCM tokens from database
    const tokens = await db.query(`
      SELECT fcm_token FROM user_fcm_tokens 
      WHERE user_id = ? AND fcm_token IS NOT NULL
    `, [userId]);
    
    if (!tokens || tokens.length === 0) {
      console.log(`[FCM] No tokens found for user ${userId}`);
      return false;
    }
    
    const deviceTokens = tokens.map(t => t.fcm_token);
    
    // Prepare message
    const message = {
      notification: {
        title,
        body
      },
      data,
      tokens: deviceTokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      }
    };
    
    // Send multicast message
    const response = await messaging.sendEachForMulticast(message);
    
    console.log(`[FCM] Successfully sent ${response.successCount} messages`);
    
    // Handle failed tokens (cleanup invalid tokens)
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error;
          if (error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered') {
            // Remove invalid token from database
            db.query(`DELETE FROM user_fcm_tokens WHERE fcm_token = ?`, [deviceTokens[idx]]);
          }
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('[FCM] Error sending push notification:', error);
    return false;
  }
};

module.exports = { sendPushNotificationToUser };
```

### 6. Integrasikan dengan Socket.IO Events

```javascript
// Di socket.io handler atau controller
const { sendPushNotificationToUser } = require('../services/notificationService');

// Saat ada new message
socket.on('new_message', async (data) => {
  // ... existing logic ...
  
  // Send push notification to recipient
  const recipientId = data.receiver_id;
  const senderName = data.sender_name;
  const messagePreview = data.message.substring(0, 50);
  
  await sendPushNotificationToUser(recipientId, 
    `Pesan dari ${senderName}`,
    `${messagePreview}...`,
    {
      type: 'new_message',
      ticketId: data.conversation_id,
      senderId: data.sender_id
    }
  );
});

// Saat ticket ditutup
socket.on('ticket_closed', async (data) => {
  // ... existing logic ...
  
  await sendPushNotificationToUser(data.user_id,
    'Tiket ditutup',
    `"${data.ticket_title}" telah ditutup oleh ${data.closed_by}`,
    {
      type: 'ticket_closed',
      ticketId: data.id
    }
  );
});

// Saat IT staff ditambahkan
socket.on('it_staff_added', async (data) => {
  // ... existing logic ...
  
  await sendPushNotificationToUser(data.staff_id,
    'IT Staff ditambahkan',
    `Anda ditambahkan ke tiket "${data.ticket_title}"`,
    {
      type: 'it_staff_added',
      ticketId: data.conversation_id
    }
  );
});
```

### 7. Buat Database Table (jika pakai MySQL)

```sql
CREATE TABLE IF NOT EXISTS user_fcm_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  fcm_token TEXT NOT NULL,
  platform ENUM('web', 'android', 'ios') DEFAULT 'web',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  UNIQUE KEY unique_user_platform (user_id, platform)
);
```

## 🧪 Testing

### Test dari Frontend:

1. Deploy frontend ke production
2. Login di browser (Chrome/Edge)
3. Browser akan request permission untuk notifications
4. Klik "Allow"
5. Cek console log, harusnya ada:
   ```
   [FCM] Firebase initialized
   [FCM] Service Worker registered
   [FCM] Token obtained: <token>
   [FCM] Token saved to backend successfully
   ```

### Test dari Backend:

Buat script test sederhana:

```javascript
// test-fcm.js
const { sendPushNotificationToUser } = require('./services/notificationService');

(async () => {
  const userId = 'USER_ID_HERE'; // Ganti dengan user ID yang valid
  
  const success = await sendPushNotificationToUser(
    userId,
    'Test Notification',
    'Ini adalah test notifikasi dari backend',
    { test: 'true' }
  );
  
  console.log('Test result:', success ? 'SUCCESS' : 'FAILED');
  process.exit(success ? 0 : 1);
})();
```

Jalankan:
```bash
node test-fcm.js
```

## 📱 Cara Add to Home Screen di Android

1. Buka website di Chrome Android
2. Tap menu (⋮) → "Add to Home screen"
3. Atau kalau sudah support PWA, akan muncul banner "Install App"
4. App akan terinstall seperti app native
5. Notifikasi push akan muncul meskipun browser tertutup!

## 🔍 Troubleshooting

### FCM Token tidak didapat:
- Pastikan HTTPS (atau localhost untuk development)
- Cek VAPID key di `.env` frontend
- Pastikan Service Worker terdaftar dengan benar

### Notifikasi tidak muncul:
- Cek permission notification di browser
- Pastikan token tersimpan di database
- Cek Firebase Console → Cloud Messaging → Reports

### Token invalid/expired:
- Backend harus cleanup invalid tokens (sudah ada di code di atas)
- User perlu re-generate token dengan refresh page

## 📚 Resources

- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [FCM Web Push Guide](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Web Push Best Practices](https://web.dev/push-notifications-overview/)

---

✅ **Frontend sudah siap!** Tinggal setup backend sesuai guide di atas.
