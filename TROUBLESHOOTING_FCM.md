# 🔧 Troubleshooting FCM - Notifikasi Tidak Muncul

## 🚨 Quick Diagnosis

### 1️⃣ Buka Diagnostic Tool

Buka browser dan akses:
```
http://localhost:5173/fcm-diagnostic.html
```

Atau jika pakai ngrok:
```
https://YOUR-NGROK-URL.ngrok.io/fcm-diagnostic.html
```

**Tool ini akan menampilkan:**
- ✅ Status Firebase configuration
- ✅ Permission notification
- ✅ FCM token (ada/tidak)
- ✅ Checklist masalah

---

## ❌ Kemungkinan Masalah & Solusi

### Problem 1: "Missing VAPID Key" atau "Missing API Key"

**Gejala**: Diagnostic tool menunjukkan error merah untuk VAPID/API Key

**Penyebab**: Environment variables tidak terbaca

**Solusi**:
```bash
# Restart dev server setelah pastikan .env sudah benar
# Tekan Ctrl+C, lalu:
npm run dev
```

Pastikan file `.env` berisi:
```env
VITE_FIREBASE_API_KEY=AIzaSyDHH5UZqIPNw8NcopGUFAB9F3dH6Ry4TWM
VITE_FIREBASE_AUTH_DOMAIN=help-desk-ba573.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=help-desk-ba573
VITE_FIREBASE_STORAGE_BUCKET=help-desk-ba573.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=593512017084
VITE_FIREBASE_APP_ID=1:593512017084:web:a7463bd1307e91fbda34b9
VITE_FIREBASE_VAPID_KEY=BE7T9eeb8bSUpDg-yjXn2hDtNJ5ZbMGHRXVvMbfF2KR4VtlSUjtxBP-c-2oQcJl-fP0qFd3hCIbh32nVMcKoJRQ
```

---

### Problem 2: "Permission Denied"

**Gejala**: Permission status = "denied"

**Penyebab**: Browser memblokir permission

**Solusi**:

#### Chrome/Edge:
1. Klik icon 🔒 di address bar
2. Pilih "Site settings"
3. Scroll ke "Notifications"
4. Ubah dari "Block" ke "Allow"
5. Refresh halaman

#### Android Chrome:
1. Tap 🔒 di address bar
2. Tap "Permissions"
3. Enable "Notifications"

---

### Problem 3: "No Token Received" atau Token Null

**Gejala**: Diagnostic menunjukkan "✗ Not found" untuk FCM token

**Penyebab**: 
- Domain tidak authorized di Firebase Console
- Service Worker tidak terdaftar
- Firebase project belum setup dengan benar

**Solusi Step-by-Step**:

#### A. Tambahkan Domain ke Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project: **help-desk-ba573**
3. Klik ⚙️ Settings → **Project settings**
4. Scroll ke bagian **Authorized domains**
5. Klik **Add domain**

**Tambahkan SEMUA domain ini** (sesuaikan dengan URL Anda):

```
localhost                    # Untuk development lokal
ngrok.io                     # Untuk semua ngrok URLs (wildcard)
trycloudflare.com           # Untuk Cloudflare Tunnel
192.168.56.50              # IP lokal Anda
```

**ATAU** tambahkan spesifik:
```
helpdesk-dev.ngrok.io       # ngrok static subdomain
comfort-abilities-underlying-pull.trycloudflare.com
```

6. Klik **Add**

#### B. Verifikasi Service Worker

Buka browser console (F12) dan cek:
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    console.log('Service Workers:', regs)
  })
}
```

Jika tidak ada Service Worker, reload halaman dengan hard refresh:
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

#### C. Coba Dapatkan Token Lagi

Setelah add domain, coba lagi:
1. Buka `/fcm-diagnostic.html`
2. Klik tombol **"🔑 Get Token"**
3. Lihat log - harusnya muncul token

---

### Problem 4: "Domain Not Authorized"

**Gejala**: Error di console: "These types of Firebase requests are not permitted for this origin"

**Penyebab**: Domain tidak ada di Firebase Authorized Domains

**Solusi**: Lihat Problem 3A di atas - tambahkan domain ke Firebase Console

**PENTING**: Setiap kali ngrok restart dan URL berubah, Anda HARUS update Firebase Console!

**Workaround untuk ngrok free tier**:
1. Gunakan ngrok dengan subdomain tetap:
   ```bash
   ngrok http 5173 --subdomain=helpdesk-dev
   ```
   
2. Atau gunakan localhost tunneling alternatif:
   - [LocalXpose](https://localxpose.io/)
   - [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/)
   - Keduanya support static domain di free tier

---

### Problem 5: Token Ada Tapi Notifikasi Tidak Masuk

**Gejala**: FCM token berhasil didapat, tapi saat test notification tidak muncul

**Kemungkinan Penyebab**:

#### A. Backend Belum Kirim via Firebase Admin SDK

FCM tidak otomatis bekerja! Backend Anda HARUS kirim notifikasi via Firebase Admin SDK.

**Cek backend Anda** - apakah sudah install Firebase Admin?

```javascript
// Di backend
const admin = require('firebase-admin')

// Initialize dengan service account
const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

// Fungsi kirim notifikasi
async function sendNotification(fcmToken, title, body) {
  await admin.messaging().send({
    notification: { title, body },
    token: fcmToken
  })
}
```

**Tanpa kode ini di backend, notifikasi tidak akan terkirim!**

#### B. Frontend Hanya Menerima Foreground Messages

FCM punya 2 mode:

1. **Foreground** (app terbuka) → JavaScript handle
2. **Background** (app tertutup/minimized) → Android system handle

Untuk background notifications, Anda perlu **Service Worker** yang lebih advanced.

---

### Problem 6: Bekerja di Desktop Tapi Tidak di Android

**Gejala**: Di PC notifikasi muncul, di HP Android tidak

**Penyebab Umum**:

1. **Android battery optimization** memblokir Chrome
   - Settings → Apps → Chrome → Battery
   - Set ke "Unrestricted"

2. **Chrome notification setting** di Android mati
   - Settings → Apps → Chrome → Notifications
   - Enable "Show notifications"

3. **Do Not Disturb** mode aktif
   - Cek icon bulan di status bar
   - Matikan DND mode

4. **HTTPS requirement**
   - FCM WAJIB HTTPS (kecuali localhost)
   - Pastikan ngrok URL pakai `https://`

---

### Problem 7: Service Worker Tidak Jalan

**Gejala**: Console error "Service Worker registration failed"

**Solusi**:

1. **Clear Service Worker lama**:
   ```javascript
   // Di browser console
   navigator.serviceWorker.getRegistrations().then(regs => {
     regs.forEach(reg => reg.unregister())
   })
   ```

2. **Hard refresh**: `Ctrl + Shift + R`

3. **Clear cache browser**
   - Chrome: `Ctrl + Shift + Delete`
   - Pilih "Cached images and files"
   - Clear data

---

## 🧪 Testing Flow yang Benar

### Test 1: Localhost Development

```bash
# Terminal 1: Start Vite
npm run dev

# Terminal 2: Start ngrok (jika perlu akses dari HP)
ngrok http 5173
```

1. Buka: `http://localhost:5173/fcm-diagnostic.html`
2. Klik "Get Token"
3. Harus dapat token
4. Klik "Test Notification"
5. Harus muncul notifikasi desktop

### Test 2: Android Device via ngrok

1. Pastikan ngrok running
2. Copy URL ngrok (e.g., `https://abc123.ngrok.io`)
3. **PENTING**: Add `ngrok.io` ke Firebase Authorized Domains
4. Di Android, buka: `https://abc123.ngrok.io/fcm-diagnostic.html`
5. Klik "Get Token"
6. Harus dapat token
7. Klik "Test Notification"
8. Harus muncul notifikasi di Android

### Test 3: Production (Cloudflare Tunnel)

1. Backend: `https://your-backend.trycloudflare.com`
2. Frontend: `https://your-frontend.ngrok.io`
3. Add KEDUA domain ke Firebase Authorized Domains
4. Test seperti di atas

---

## 📋 Checklist Lengkap

Cek SATU PER SATU:

- [ ] Firebase project dibuat di console.firebase.google.com
- [ ] Web app ditambahkan ke Firebase project
- [ ] VAPID key digenerate di Cloud Messaging settings
- [ ] Semua env variables di `.env` terisi
- [ ] `npm install` sudah dijalankan
- [ ] Dev server running (`npm run dev`)
- [ ] Domain ditambahkan ke Firebase Authorized Domains
- [ ] Notification permission granted di browser
- [ ] FCM token berhasil didapat (cek di diagnostic tool)
- [ ] Backend sudah install firebase-admin
- [ ] Backend mengirim notifikasi via Firebase Admin SDK
- [ ] Service Worker registered (cek di console)
- [ ] HTTPS digunakan (bukan HTTP, kecuali localhost)

---

## 🎯 Quick Fix Commands

### Restart Everything
```bash
# Stop semua process (Ctrl+C)

# Clear cache
rm -rf node_modules/.vite
rm -rf dist

# Reinstall
npm install

# Start ulang
npm run dev
```

### Check Environment Variables
```bash
# Di browser console (F12)
console.log(import.meta.env)
```

Harusnya muncul object dengan semua VITE_FIREBASE_* variables.

### Force Service Worker Update
```javascript
// Di browser console
navigator.serviceWorker.ready.then(reg => {
  reg.update()
  console.log('Service Worker updated')
})
```

---

## 🆘 Masih Tidak Bisa?

### Langkah Terakhir:

1. **Screenshot diagnostic tool** (`/fcm-diagnostic.html`)
2. **Copy console log** (F12 → Console tab)
3. **Check Firebase Console**:
   - Project Settings → General → Your apps
   - Cloud Messaging → Reports (apakah ada delivery attempts?)

### Pertanyaan Penting:

1. Apakah Anda testing di Android atau Desktop?
2. Apakah ngrok URL sudah diubah ke HTTPS?
3. Sudahkah add domain ke Firebase Console?
4. Apakah backend sudah pakai Firebase Admin SDK?
5. Apa error message yang muncul di console?

---

## 💡 Pro Tips

### Tip 1: Gunakan Firefox untuk Debugging
Firefox Developer Edition punya DevTools lebih baik untuk Service Workers

### Tip 2: Logging di Backend
Tambahkan logging di backend saat kirim notifikasi:
```javascript
console.log('Sending to FCM token:', fcmToken)
console.log('Response from Firebase:', response)
```

### Tip 3: Test dengan Firebase Console Composer
Di Firebase Console → Cloud Messaging → New Campaign:
- Buat notification test
- Send to single user
- Masukkan FCM token manual
- Ini bypass backend, langsung test Firebase → Device

### Tip 4: Pakai ngrok inspect
```bash
ngrok http 5173 --inspect-bind-address=0.0.0.0
```
Buka `http://localhost:4040` untuk lihat semua HTTP request/response

---

**Good luck! 🍀**  
Mulai dari `/fcm-diagnostic.html` - itu kunci utama debugging!
