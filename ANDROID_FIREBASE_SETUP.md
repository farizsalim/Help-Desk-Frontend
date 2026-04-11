# 🔥 Setup Firebase Cloud Messaging untuk Android

## 📋 Overview

Firebase Cloud Messaging (FCM) adalah solusi **TERBAIK** untuk notifikasi push di Android karena:
- ✅ Native integration dengan Android
- ✅ Bekerja bahkan saat app ditutup/background
- ✅ Reliable dan cepat delivery-nya
- ✅ Gratis unlimited notifications
- ✅ Support topic messaging dan user targeting

---

## 🚀 Step-by-Step Setup

### Step 1: Buat Firebase Project

1. **Buka** [Firebase Console](https://console.firebase.google.com/)
2. **Click** "Add project" atau select existing project
3. **Enter project name**: `Help-Desk-Chat` (atau nama lain)
4. **Disable** Google Analytics (optional, bisa enable nanti)
5. **Click** "Create project"
6. **Wait** for project creation
7. **Click** "Continue"

---

### Step 2: Add Web App ke Firebase

1. **Di Project Overview**, click icon **Web** (`</>`)
2. **Enter app nickname**: `Help Desk Web`
3. **Check** "Also set up Firebase Hosting" (optional)
4. **Click** "Register app"
5. **Copy** `firebaseConfig` object yang muncul

**Contoh config:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "help-desk-chat.firebaseapp.com",
  projectId: "help-desk-chat",
  storageBucket: "help-desk-chat.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

---

### Step 3: Enable Cloud Messaging

1. **Di Firebase Console**, go to **Engage** → **Cloud Messaging**
2. **Scroll down** ke "Web Push certificates" section
3. **Click** "Generate key pair" atau "Add another key pair"
4. **Copy** kedua values ini:
   - **Key pair name**: (auto-generated, e.g., "Web Push Certificate")
   - **Public key (VAPID)**: String panjang yang dimulai dengan `B...` atau `BK...`

**Simpan VAPID key ini!** Kita butuh untuk `.env`

---

### Step 4: Update Frontend .env

**Edit file `.env` di project frontend:**

```env
# Copy dari Firebase config yang kamu dapat di Step 2
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=help-desk-chat.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=help-desk-chat
VITE_FIREBASE_STORAGE_BUCKET=help-desk-chat.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Copy VAPID key dari Step 3
VITE_FIREBASE_VAPID_KEY=BKagOny0KF_2pCJQ3m.... (paste full key disini)
```

---

### Step 5: Update Firebase Config di Code

File sudah dibuat: [`src/config/firebase.js`](src/config/firebase.js)

Code akan otomatis read dari `.env`, jadi pastikan semua variables terisi!

---

### Step 6: Build & Test

```bash
# Install dependencies (kalau belum)
npm install

# Build untuk production
npm run build

# Deploy ke Vercel
git add .
git commit -m "feat: add Firebase Cloud Messaging for Android notifications"
git push
```

---

## 📱 Testing di Android

### 1. **Enable Notifications di App**

1. Buka app di Chrome Android (harus HTTPS/production)
2. Click button "Aktifkan Notifikasi" 
3. Grant permission saat diminta
4. **Console log harus muncul:**
   ```
   [FCM] Requesting notification permission...
   [FCM] Permission granted, getting token...
   [FCM] ✅ Got FCM token: eXrT... (long string)
   [FCM] ✅ Token saved to backend
   ```

### 2. **Test Kirim Notifikasi Manual**

**Via Firebase Console:**

1. Go to **Engage** → **Cloud Messaging**
2. Click **"New notification"**
3. **Enter notification text**:
   - Title: `Test Notification`
   - Text: `Ini test notifikasi dari Firebase!`
4. **Click** "Next"
5. **Target**: Pilih "User segment" atau "Topic" (nanti kita setup di backend)
6. **Click** "Review"
7. **Click** "Publish"

**Notifikasi HARUS muncul di Android!**

---

## 🔧 Backend Integration (PENTING!)

Frontend sudah ready, sekarang backend perlu:

### A. Save FCM Token Endpoint

```javascript
// POST /api/save-fcm-token
app.post('/api/save-fcm-token', async (req, res) => {
  const { fcm_token } = req.body;
  const userId = req.user.id; // From JWT auth
  
  // Save to database
  await db.fcmTokens.upsert({
    where: { userId },
    create: { userId, fcmToken: fcm_token },
    update: { fcmToken: fcm_token }
  });
  
  res.json({ success: true });
});
```

### B. Send Notification via FCM

Install Firebase Admin SDK di backend:

```bash
cd backend
npm install firebase-admin
```

Setup admin:

```javascript
// backend/src/firebaseAdmin.js
const admin = require('firebase-admin');

// Download service account key dari Firebase Console:
// Project Settings → Service Accounts → Generate New Private Key
// Save sebagai: backend/firebase-service-account.json

const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
```

Send notification function:

```javascript
// backend/src/utils/sendNotification.js
const admin = require('../firebaseAdmin');

async function sendFCMNotification(userId, title, body, data = {}) {
  // Get user's FCM token from database
  const userToken = await db.fcmTokens.findUnique({
    where: { userId }
  });
  
  if (!userToken?.fcmToken) {
    console.log('User has no FCM token');
    return;
  }
  
  const message = {
    notification: {
      title: title,
      body: body
    },
    data: {
      ticketId: data.ticketId?.toString(),
      type: data.type,
      senderName: data.senderName
    },
    token: userToken.fcmToken,
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        clickAction: '/'
      }
    },
    webpush: {
      headers: {
        Urgency: 'high'
      }
    }
  };
  
  try {
    const response = await admin.messaging().send(message);
    console.log('✅ FCM sent successfully:', response);
    return true;
  } catch (error) {
    console.error('❌ FCM error:', error);
    return false;
  }
}

module.exports = sendFCMNotification;
```

Usage example:

```javascript
// Saat ada new message
sendFCMNotification(recipientUserId, '💬 Pesan Baru', 'John mengirim pesan', {
  ticketId: conversationId,
  type: 'new_message',
  senderName: 'John'
});
```

---

## 🎯 Comparison: FCM vs Web Push API

| Feature | Firebase Cloud Messaging | Web Push API |
|---------|------------------------|--------------|
| **Android Support** | ✅ Native (Best) | ⚠️ Limited |
| **Background Delivery** | ✅ Yes (via system) | ❌ No (needs SW running) |
| **App Closed** | ✅ Still works | ❌ Won't work |
| **Reliability** | ✅ Very High | ⚠️ Medium |
| **Setup Complexity** | Medium | Simple |
| **iOS Support** | ✅ Yes (via APNs) | ❌ No |
| **Analytics** | ✅ Built-in | ❌ No |
| **Topic Messaging** | ✅ Yes | ❌ No |

**Kesimpulan:** FCM jauh lebih baik untuk Android! 🚀

---

## 🐛 Troubleshooting

### Error: "Missing Firebase config"

**Check:**
```javascript
console.log(import.meta.env.VITE_FIREBASE_API_KEY)
// Harus print key, bukan undefined
```

**Fix:** Pastikan `.env` terisi semua values-nya

### Error: "Permission denied"

**Fix:**
1. Chrome Settings → Site Permissions → Notifications
2. Find your domain
3. Toggle to Allow

### Notifikasi tidak muncul di Android

**Check:**
1. ✅ Firebase project sudah benar?
2. ✅ VAPID key sudah dicopy dengan benar?
3. ✅ App sudah di-add to home screen?
4. ✅ Permission sudah granted?
5. ✅ Console log menunjukkan token berhasil didapat?

**Debug:**
```javascript
// Paste di browser console Android
console.log('FCM Token:', localStorage.getItem('fcm_token'))
console.log('Permission:', Notification.permission)
```

### Token invalid/expired

**Solution:**
```javascript
// Force refresh token
import { refreshFCMToken } from './services/fcmService'
await refreshFCMToken()
```

---

## ✅ Final Checklist

Sebelum deploy:

- [ ] Firebase project created
- [ ] Web app registered
- [ ] Config copied to `.env`
- [ ] VAPID key generated and added
- [ ] All env variables filled (no `YOUR_` placeholders)
- [ ] `npm install` done
- [ ] Build successful: `npm run build`
- [ ] Deployed with HTTPS
- [ ] Tested on Android device
- [ ] FCM token appears in console log
- [ ] Test notification from Firebase Console works

---

## 🆘 Butuh Bantuan?

**Kirim info ini:**

1. Screenshot Firebase Console → Project Settings → General
2. Console log dari Android (via USB debug)
3. Output dari: `console.log(import.meta.env)`
4. Error message lengkap (jika ada)

**Tanpa Firebase config yang benar, tidak bisa jalan!**

---

## 📚 Resources

- [Firebase Docs: Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/js-client)
- [Firebase Console](https://console.firebase.google.com/)
- [FCM Sample App](https://github.com/firebase/samples/tree/main/messaging)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

**Happy Pushing! 🚀**
