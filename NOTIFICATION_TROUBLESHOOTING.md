# 🔔 Troubleshooting: Notifikasi Tidak Muncul di Android

## ⚠️ Masalah Umum & Solusi

### 1. **Ikon PWA Belum Ada** (PENYEBAB UTAMA)

Notifikasi tidak akan muncul jika icon PWA belum ada.

**Solusi:**
1. Buka `public/icon-generator.html` di browser
2. Upload logo Anda (PNG/SVG, minimal 512x512px)
3. Klik "Generate Icons"
4. Download ZIP dan extract ke folder `public/`
5. Pastikan ada file:
   - `public/pwa-192x192.png`
   - `public/pwa-512x512.png`

### 2. **Permission Belum Granted**

Cek di browser console:
```javascript
console.log(Notification.permission)
// Harus 'granted', jika 'denied' atau 'default' tidak akan muncul
```

**Solusi:**
```javascript
Notification.requestPermission()
```

### 3. **Service Worker Tidak Aktif**

Cek di Chrome:
1. Buka `chrome://serviceworker-internals/`
2. Cari domain aplikasi Anda
3. Pastikan status "Running"

**Solusi:**
- Hard refresh: `Ctrl+Shift+R` (Windows) atau `Cmd+Shift+R` (Mac)
- Clear cache dan reload
- Rebuild: `npm run build` lalu redeploy

### 4. **Testing di Localhost vs Production**

Notifikasi PWA **HANYA bekerja di HTTPS** (kecuali localhost).

**Check:**
- ✅ `http://localhost:5173` - Works
- ✅ `https://yourdomain.com` - Works  
- ❌ `http://yourdomain.com` - **TIDAK WORKS** (tidak ada HTTPS)

**Solusi:**
- Deploy ke Vercel (auto HTTPS)
- Atau gunakan ngrok untuk testing: `ngrok http 5173`

### 5. **Android Chrome Settings**

Pastikan notifikasi tidak diblokir di Android:

1. Buka Chrome di Android
2. Settings → Site Permissions → Notifications
3. Cari website Anda
4. Pastikan **ALLOWED**

### 6. **App Belum Di-Add to Home Screen**

Untuk experience seperti WhatsApp:

1. Buka app di Chrome Android
2. Menu (⋮) → "Add to Home screen"
3. Install app
4. Buka dari home screen
5. Enable notifications

## 🧪 Testing Steps

### Step 1: Check Requirements
Buka browser console, jalankan:
```javascript
import { checkNotificationRequirements } from './src/utils/testNotification.js'
checkNotificationRequirements()
```

Harus semua ✅ PASS

### Step 2: Test Basic Notification
```javascript
import { testBasicNotification } from './src/utils/testNotification.js'
testBasicNotification()
```

Harus muncul notifikasi test

### Step 3: Test WhatsApp-Style
```javascript
import { testWhatsAppStyleNotification } from './src/utils/testNotification.js'
testWhatsAppStyleNotification()
```

Harus muncul notifikasi seperti WhatsApp

### Step 4: Test via UI
1. Tambahkan `<NotificationToggle />` di Dashboard
2. Click "Aktifkan Notifikasi"
3. Grant permission
4. Kirim pesan test

## 📱 Debug di Android

### Cara Lihat Console Log dari Android:

1. **Enable USB Debugging** di Android
2. **Connect ke PC via USB**
3. **Buka Chrome di PC**: `chrome://inspect/#devices`
4. **Pilih device dan inspect**
5. **Lihat Console tab**

Log yang harus muncul:
```
[NOTIF] Sending notification: {...}
[NOTIF] Full notification options: {...}
[NOTIF] Service Worker not available, using fallback
[NOTIF] Notification object created: {...}
[NOTIF] Notification shown successfully!
```

Jika ada error, akan muncul:
```
[NOTIF] Error sending notification: ...
```

## 🔧 Common Errors

### Error: "Permission denied"
```javascript
// Cek permission
console.log(Notification.permission) // 'denied'

// User harus manual enable di browser settings
// Atau reset permission di chrome://settings/content/notifications
```

### Error: "Service worker registration failed"
```javascript
// Biasanya karena:
// 1. Tidak ada HTTPS
// 2. Browser tidak support
// 3. Mixed content (HTTP + HTTPS)

// Fix: Pastikan HTTPS dan rebuild
npm run build
```

### Error: "showNotification is not a function"
```javascript
// Service Worker belum ready
// Fix: Tunggu service worker ready dulu

const registration = await navigator.serviceWorker.ready
registration.showNotification(...)
```

## ✅ Checklist Lengkap

- [ ] Generate PWA icons (`pwa-192x192.png`, `pwa-512x512.png`)
- [ ] Copy icons ke folder `public/`
- [ ] Build ulang: `npm run build`
- [ ] Deploy dengan HTTPS
- [ ] Add to Home Screen di Android
- [ ] Grant notification permission
- [ ] Test dengan `testBasicNotification()`
- [ ] Cek console log di Android
- [ ] Verify service worker active

## 💡 Tips Tambahan

### 1. **Gunakan Icon yang Jelas**
- Minimal 512x512px
- Background kontras
- Logo sederhana dan recognizable

### 2. **Test di Berbagai Device**
- Chrome Android (terbaik)
- Samsung Internet
- Firefox Android

### 3. **Vibration Pattern**
```javascript
vibrate: [200, 100, 200] // Vibrasi 200ms, pause 100ms, vibrasi 200ms
```

### 4. **Require Interaction**
```javascript
requireInteraction: true // Notifikasi tetap tampil sampai diklik
```

### 5. **Badge Icon**
```javascript
badge: '/pwa-192x192.png' // Icon kecil di status bar
```

## 🆘 Masih Bermasalah?

1. **Screenshot error console**
2. **Copy full error message**
3. **Test di desktop browser dulu**
4. **Cek service worker di `chrome://serviceworker-internals/`**

## 📞 Quick Test Command

Jalankan ini di browser console untuk quick debug:

```javascript
// One-liner test
new Notification('Test', { body: 'Hello!', icon: '/pwa-192x192.png' })
```

Jika tidak muncul, berarti:
- ❌ Permission denied
- ❌ Icon tidak ada
- ❌ Browser tidak support
