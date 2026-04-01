# Help-Desk Frontend

## 🔧 Stack
- React + Vite
- Zustand buat store (global state)
- SocketIO untuk real-time
- Tailwind untuk style

## 📌 Struktur yang penting
- `src/page`
  - `Dashboard.jsx` (main dashboard)
  - `Login.jsx` / `Register.jsx`
- `src/components`
  - `NotificationBanner.jsx` (banner izin notifikasi)
  - `ProtectedRoute.jsx` (routing aman)
  - `dashboard/*` (UI dashboard, ticket list, stats, modal)
- `src/hooks`
  - `useDashboard.js` (hook logika dashboard)
  - `useNotifications.js` (hook izin notifikasi)
- `src/stores`
  - `authStore.js`, `conversationStore.js`, `messageStore.js`, `socketStore.js` (Zustand store)
- `src/utils/notificationService.js` (send notification browser)

## ⚙️ Fitur yang jalan
- Login/Logout
- Create ticket
- List ticket + filter
- Chat di dashboard
- Notifikasi: new message / ticket closed / staff ditambahkan / new ticket
- Modal untuk assign, chat, create ticket

## ▶️ Cara jalanin
1. `npm install`
2. `npm run dev`
3. buka `localhost:5173`

## 🚧 Catatan
- Notifikasi di desktop kompatibel. HP butuh PWA + service worker biar background popup.
- Store pake Zustand di `src/stores`.
- Lagi yang diimprove bisa: notif click open ticket, service worker, lebih banyak validasi.
