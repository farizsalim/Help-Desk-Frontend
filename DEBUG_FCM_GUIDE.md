# 🐛 Debug Mode untuk FCM

## 🔍 Masalah yang Ditemukan

Di Android, diagnostic tool stuck di "Checking..." karena:
1. Environment variables tidak ter-load dengan benar
2. Firebase SDK tidak bisa initialize
3. Service Worker tidak terdaftar

## ✅ Solusi Quick Fix

### 1. Buka Browser Console di Android

Saat membuka halaman `/fcm-diagnostic.html` di Android:

1. **Enable USB Debugging** di HP Android
2. **Connect ke PC via USB**
3. **Di Chrome Desktop**, buka: `chrome://inspect/#devices`
4. **Klik "Inspect"** pada device Android Anda
5. **Lihat Console tab** - akan muncul log detail

### 2. Cek Log yang Muncul

Anda harusnya melihat log seperti ini:

```
[FCM] === Starting Permission Request ===
[FCM] Environment check:
- API Key: Present
- Project ID: Present
- VAPID Key: Present (first 10): BE7T9eeb8b...
[FCM] Initializing Firebase...
[FCM] Messaging instance obtained: true
[FCM] Requesting notification permission...
[FCM] Permission result: granted
[FCM] Getting token with VAPID key...
```

Jika ada error, akan muncul:
```
❌ [FCM] Error getting FCM token: ...
```

---

## 🛠️ Kemungkinan Fix

### Fix 1: Hard Refresh

Di Android, lakukan **hard refresh**:
1. Tap menu (⋮) di Chrome
2. Pilih "Reload" sambil menahan tombol Shift
3. Atau: Settings → Privacy → Clear browsing data

### Fix 2: Clear Service Worker

Di browser console Android:
```javascript
// Unregister semua Service Worker
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister())
  console.log('Service Workers unregistered')
})

// Clear localStorage
localStorage.clear()
console.log('LocalStorage cleared')

// Reload halaman
location.reload(true)
```

### Fix 3: Manual Test Initialization

Test manual di console:
```javascript
import { initializeFirebase } from './src/services/fcmService.js'

try {
  const app = await initializeFirebase()
  console.log('✅ Firebase initialized:', app)
} catch (error) {
  console.error('❌ Firebase init failed:', error)
}
```

---

## 🎯 Langkah Testing Ulang

### Step 1: Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 2: Test di Desktop Dulu

Buka: `http://localhost:5173/fcm-diagnostic.html`

Harusnya langsung dapat token jika domain sudah authorized.

### Step 3: Test di Android

1. **Start ngrok**:
   ```bash
   ngrok http 5173 --subdomain=helpdesk-dev
   ```

2. **Verify Firebase Authorized Domains**:
   - Buka Firebase Console
   - Pastikan `ngrok.io` atau `helpdesk-dev.ngrok.io` ada di Authorized domains
   
3. **Buka di Android**:
   ```
   https://helpdesk-dev.ngrok.io/fcm-diagnostic.html
   ```

4. **Connect USB dan Inspect**:
   - Buka `chrome://inspect/#devices` di Chrome Desktop
   - Klik "Inspect" untuk device Android
   - Lihat console log

5. **Klik "Get Token"**:
   - Lihat console output
   - Jika berhasil, akan muncul token
   - Jika gagal, lihat error message

---

## 📋 Checklist Debugging

Cek satu per satu:

- [ ] `.env` file ada dan berisi semua Firebase config
- [ ] Dev server running (`npm run dev`)
- [ ] ngrok running dengan URL tetap
- [ ] Domain authorized di Firebase Console
- [ ] Notification permission granted di Android
- [ ] Service Worker registered (cek di console)
- [ ] No errors di browser console
- [ ] Firebase initialized successfully
- [ ] VAPID key correct (copy-paste tanpa spasi)

---

## 🆘 Jika Masih Stuck

### Screenshot/Kirim Ini:

1. **Console log lengkap** dari Chrome inspect
2. **Network tab** - cek apakah ada request yang failed
3. **Application tab** → Service Workers - apakah registered
4. **Application tab** → Local Storage - apakah ada fcm_token

### Pertanyaan:

1. Apakah di desktop bisa dapat token?
2. Apa error message yang muncul di console Android?
3. Sudahkah add `ngrok.io` ke Firebase Authorized Domains?
4. Apakah notification permission sudah granted?

---

## 💡 Pro Tip: Test dengan Firebase Console

Untuk bypass semua code, test langsung dari Firebase Console:

1. Buka Firebase Console → Cloud Messaging
2. Click "New campaign" atau "Send your first message"
3. Pilih "Notification"
4. Di "Target", pilih "Single user"
5. Masukkan FCM token (jika sudah dapat)
6. Send test notification

Jika notifikasi masuk → Firebase config OK, masalah di frontend code.  
Jika tidak masuk → Firebase config atau domain authorization bermasalah.

---

**Next step**: Jalankan ulang dev server, test di Android dengan USB debugging enabled, dan kirim screenshot console log!
