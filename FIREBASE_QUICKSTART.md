# 🚀 Quick Start: Firebase Android Notifications

## ⚡ 5 Menit Setup

### 1. Buat Firebase Project (2 menit)

```
1. Buka https://console.firebase.google.com/
2. Click "Add project"
3. Name: "Help-Desk"
4. Disable Analytics (optional)
5. Create → Continue
```

### 2. Add Web App (1 menit)

```
1. Click icon Web (</>)
2. Nickname: "Help Desk Web"
3. Register app
4. COPY firebaseConfig object!
```

### 3. Generate VAPID Key (30 detik)

```
1. Go to: Engage → Cloud Messaging
2. Scroll ke "Web Push certificates"
3. Generate key pair
4. COPY Public key (VAPID)
```

### 4. Update .env (1 menit)

Edit file `.env`:

```env
# Paste dari firebaseConfig
VITE_FIREBASE_API_KEY=AIzaSy... (dari step 2)
VITE_FIREBASE_AUTH_DOMAIN=help-desk.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=help-desk
VITE_FIREBASE_STORAGE_BUCKET=help-desk.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123

# Paste VAPID key (dari step 3)
VITE_FIREBASE_VAPID_KEY=BKagOny0KF_2pCJQ3m... (full key)
```

### 5. Build & Deploy (1 menit)

```bash
npm run build
git push  # Deploy ke Vercel
```

---

## 📱 Test di Android

### Step 1: Enable Notifications

```
1. Buka app di Chrome Android
2. Click "Aktifkan Notifikasi"
3. Grant permission
4. Check console log:
   [FCM] ✅ Got FCM token: eXrT...
```

### Step 2: Send Test Notification

```
1. Firebase Console → Cloud Messaging
2. New notification
3. Title: "Test"
4. Text: "Hello from Firebase!"
5. Publish
6. Check HP Android!
```

**Harus muncul notifikasi seperti WhatsApp!** ✅

---

## 🔧 Backend Code Snippet

Save this untuk backend integration:

```javascript
// Install dulu: npm install firebase-admin

const admin = require('firebase-admin');

// Download service account key dari Firebase Console:
// Project Settings → Service Accounts → Generate New Private Key

admin.initializeApp({
  credential: admin.credential.cert(require('./service-account-key.json'))
});

async function sendNotif(userId, title, message, ticketId) {
  // Get FCM token from database
  const token = await db.getFCMToken(userId);
  
  if (!token) return;
  
  await admin.messaging().send({
    token: token,
    notification: {
      title: title,
      body: message
    },
    data: {
      ticketId: ticketId.toString(),
      type: 'new_message'
    },
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        clickAction: '/'
      }
    }
  });
  
  console.log('✅ Notification sent!');
}

// Usage:
sendNotif(userId, '💬 Pesan Baru', 'John mengirim pesan', conversationId);
```

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] Web app registered  
- [ ] Config in `.env` (all fields filled)
- [ ] VAPID key added
- [ ] Build successful
- [ ] Deployed with HTTPS
- [ ] Tested on Android
- [ ] Console shows FCM token
- [ ] Test notification works

---

## 🆘 Common Issues

**Issue:** `undefined` in console
- **Fix:** Check `.env` values, rebuild

**Issue:** No token in console
- **Fix:** Grant permission, check HTTPS

**Issue:** Notification tidak muncul
- **Fix:** Check Android notification settings, DND mode

**Still stuck?** 
Read full guide: [ANDROID_FIREBASE_SETUP.md](ANDROID_FIREBASE_SETUP.md)

---

**That's it! Firebase FCM ready for Android! 🎉**
