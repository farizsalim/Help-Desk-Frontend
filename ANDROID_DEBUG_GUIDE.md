# 📱 Debug Notifikasi di Android - Step by Step

## ⚠️ MASALAH UMUM & SOLUSI CEPAT

### 1. **Cek Console Log di Android** (PALING PENTING!)

**Cara Lihat Console:**

1. **Di HP Android:**
   - Buka Chrome
   - Settings → Developer tools → Enable USB debugging
   
2. **Connect ke PC via USB**

3. **Di PC (Chrome):**
   - Buka `chrome://inspect/#devices`
   - Pilih device Android kamu
   - Click "Inspect" pada tab Help Desk
   - Buka **Console** tab

4. **Enable Notifications:**
   - Di HP, buka app Help Desk
   - Click "Aktifkan Notifikasi"
   - Grant permission
   - **Lihat console log di PC**

**Log yang HARUS muncul:**
```
[NOTIF] Sending notification: {...}
[NOTIF] Full notification options: {...}
[NOTIF] Service Worker status: {hasSW: true, hasController: true, ready: 'yes'}
[NOTIF] Attempting via Service Worker...
[NOTIF] Service Worker registration ready: {...}
[NOTIF] ✅ Notification shown via Service Worker
```

**Jika ada error:**
```
[NOTIF] ❌ SW showNotification failed: ...
[NOTIF] Showing direct notification: ...
[NOTIF] ✅ Notification shown successfully!
```

---

## 🔍 CHECKLIST DEBUGGING

### Step 1: Test Permission
Buka console di Android, jalankan:
```javascript
console.log('Permission:', Notification.permission)
// Harus: 'granted'
// Jika 'denied' atau 'default': tidak akan muncul notif
```

**Fix jika denied:**
1. Chrome Settings → Site Permissions → Notifications
2. Cari domain app kamu
3. Enable/Allow

### Step 2: Test Manual Notification
Jalankan di console:
```javascript
new Notification('TEST', {
  body: 'Ini test notifikasi',
  icon: '/pwa-192x192.png',
  badge: '/pwa-192x192.png',
  vibrate: [200, 100, 200]
})
```

**Jika tidak muncul:**
- ❌ Icon tidak ada → Generate icons dulu!
- ❌ Permission denied → Enable di settings
- ❌ Browser tidak support → Coba update Chrome

### Step 3: Check Service Worker
Jalankan di console:
```javascript
console.log('Has Service Worker:', 'serviceWorker' in navigator)
console.log('Has Controller:', !!(navigator.serviceWorker && navigator.serviceWorker.controller))

navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('SW Registrations:', regs)
})
```

**Harus muncul:**
```
Has Service Worker: true
Has Controller: true
SW Registrations: [ServiceWorkerRegistration]
```

### Step 4: Check Icons
Jalankan di console:
```javascript
// Test load icon
fetch('/pwa-192x192.png')
  .then(r => r.blob())
  .then(blob => console.log('Icon loaded:', blob.size, 'bytes'))
  .catch(e => console.error('Icon NOT found!', e))
```

**Jika error 404:**
```
❌ Icon NOT found!
```
→ **Generate icons dulu!** Buka `/icon-generator.html`

---

## 🎯 TESTING FLOW YANG BENAR

### 1. **Pastikan Icons Ada**
```bash
# Cek di folder public/
ls public/pwa-192x192.png
ls public/pwa-512x512.png
```

**Jika belum ada:**
1. Buka browser: `http://localhost:5173/icon-generator.html`
2. Upload logo PNG (min 512x512px)
3. Click "Generate Icons"
4. Download ZIP
5. Extract ke `public/`

### 2. **Build & Deploy**
```bash
npm run build
git push  # Deploy ke Vercel
```

### 3. **Test di Android**

**A. Add to Home Screen:**
1. Buka app di Chrome Android
2. Menu (⋮) → "Add to Home screen"
3. Install
4. Open dari home screen

**B. Enable Notifications:**
1. Click button "Aktifkan Notifikasi"
2. Grant permission saat diminta
3. **Cek console log** (via USB debug)

**C. Test Kirim Pesan:**
1. Login sebagai user
2. Create ticket baru
3. Balas pesan
4. **Cek apakah notif muncul di HP**

---

## 🐛 ERROR COMMON & FIX

### Error: "Notification is not a constructor"
**Penyebab:** Browser tidak support
**Fix:** Update Chrome Android ke versi terbaru

### Error: "Permission denied"
**Penyebab:** User block notification
**Fix:**
1. Chrome Settings → Site Permissions → Notifications
2. Find your domain
3. Toggle to Allow

### Error: "Icon not found" / 404
**Penyebab:** File icon tidak ada
**Fix:** Generate icons via `/icon-generator.html`

### Error: "ServiceWorker not ready"
**Penyebab:** SW belum activate
**Fix:**
1. Hard refresh: Ctrl+Shift+R
2. Close dan reopen browser
3. Rebuild: `npm run build`

### Notif muncul tapi tidak ada suara/vibrasi
**Penyebab:** Android Do Not Disturb mode
**Fix:**
1. Settings → Sound → Do Not Disturb → OFF
2. App notification settings → Enable vibration

---

## 📊 EXPECTED CONSOLE LOGS

### Saat Enable Notifications:
```
[NOTIF] Sending notification: {title: '✅ Notifikasi Berhasil', ...}
[NOTIF] Full notification options: {...}
[NOTIF] Service Worker status: {hasSW: true, hasController: true, ready: 'yes'}
[NOTIF] Attempting via Service Worker...
[NOTIF] Service Worker registration ready: ServiceWorkerRegistration
[NOTIF] ✅ Notification shown via Service Worker
```

### Saat Terima Pesan Baru:
```
[NOTIF] Sending notification: {title: '💬 Pesan Baru dari John', ...}
[NOTIF] Full notification options: {...}
[NOTIF] Service Worker status: {hasSW: true, ...}
[NOTIF] Attempting via Service Worker...
[NOTIF] ✅ Notification shown via Service Worker
```

### Jika Direct Notification (fallback):
```
[NOTIF] ❌ SW showNotification failed: ...
[NOTIF] Showing direct notification: 💬 Pesan Baru dari John
[NOTIF] Notification object created: Notification
[NOTIF] ✅ Notification shown successfully!
```

---

## ✅ FINAL CHECKLIST

Sebelum bilang "tidak work", pastikan:

- [ ] Generate PWA icons (`pwa-192x192.png`, `pwa-512x512.png`)
- [ ] Copy icons ke `public/`
- [ ] Build: `npm run build`
- [ ] Deploy dengan HTTPS (Vercel ✅)
- [ ] Add to Home Screen di Android
- [ ] Grant notification permission
- [ ] Test manual: `new Notification('TEST', {...})`
- [ ] Cek console log via USB debug
- [ ] Verify semua log muncul tanpa error
- [ ] Test dalam mode DND off
- [ ] Test volume notifikasi max

---

## 🆘 MASIH BERMASALAH?

**Kirim screenshot/console log ini:**

1. **Full console output** dari `chrome://inspect/`
2. **Test manual notification** result
3. **Icon check** result (`fetch('/pwa-192x192.png')`)
4. **Service Worker registration** status
5. **Permission status** (`Notification.permission`)

**Tanpa console log, susah bantu!**

---

## 💡 TIPS ANDROID SPESIFIK

### 1. **Samsung Devices**
- Settings → Apps → Chrome → Notifications → Enable
- Settings → Notifications → Status bar → Show icons

### 2. **Xiaomi/Poco**
- Settings → Apps → Manage apps → Chrome → Notifications → Enable
- Settings → Notifications → Lock screen → Show notifications

### 3. **Oppo/Realme**
- Settings → Notification & Status bar → App notifications → Chrome → Enable

### 4. **Vivo**
- Settings → Notifications → App notifications → Chrome → Enable

### 5. **General Android**
- Long press notification → Settings → Enable all categories
- Make sure "Silent" is OFF

---

## 🎯 QUICK TEST COMMAND

Paste ini di console Android untuk quick test lengkap:

```javascript
(async () => {
  console.log('🔍 Starting notification test...')
  
  // 1. Check permission
  const perm = Notification.permission
  console.log('1️⃣ Permission:', perm)
  
  if (perm !== 'granted') {
    console.log('⚠️ Requesting permission...')
    await Notification.requestPermission()
  }
  
  // 2. Check service worker
  const hasSW = 'serviceWorker' in navigator
  console.log('2️⃣ Has Service Worker:', hasSW)
  
  // 3. Check icons
  try {
    const iconRes = await fetch('/pwa-192x192.png')
    console.log('3️⃣ Icon exists:', iconRes.ok)
  } catch (e) {
    console.log('3️⃣ Icon missing!', e)
  }
  
  // 4. Send test notification
  console.log('4️⃣ Sending test notification...')
  new Notification('✅ TEST SUCCESS', {
    body: 'Jika ini muncul, notifikasi bekerja!',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'test-' + Date.now()
  })
  
  console.log('5️⃣ Check notification tray!')
})()
```

**Run command ini di console Android (via USB debug)!**
