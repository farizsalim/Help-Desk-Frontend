# PWA Push Notification Setup Guide

## 1. Generate VAPID Keys

Visit https://web-push-codelab.glitch.me/ to generate your VAPID keys.

You will get:
- **Public Key** (safe to expose in frontend)
- **Private Key** (keep secret, for backend only)

## 2. Update Frontend .env

Copy the public key to your `.env` file:

```env
VITE_VAPID_PUBLIC_KEY=your_generated_public_key_here
```

## 3. Backend Setup (Required)

Your backend needs to support Web Push API. Here's a simple example using Node.js:

### Install dependencies:
```bash
npm install web-push
```

### Generate keys (backend):
```javascript
const webPush = require('web-push');

const vapidKeys = webPush.generateVAPIDKeys();

console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

### Setup VAPID (backend):
```javascript
webPush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
```

### Store subscriptions endpoint:
```javascript
app.post('/api/subscribe', async (req, res) => {
  const subscription = req.body;
  
  // Save subscription to database
  await saveSubscription(subscription);
  
  res.status(201).json({ message: 'Subscription saved' });
});
```

### Send push notification:
```javascript
async function sendNotification(subscription, payload) {
  await webPush.sendNotification(subscription, JSON.stringify(payload));
}

// Usage:
sendNotification(userSubscription, {
  title: 'Pesan Baru',
  body: 'Anda memiliki pesan baru dari John',
  data: {
    ticketId: '123',
    type: 'new_message'
  }
});
```

## 4. Testing

1. Build the app: `npm run build`
2. Deploy to Vercel or test locally with `npm run preview`
3. Open the app on Android Chrome
4. Click "Aktifkan Notifikasi" button
5. Grant permission when prompted
6. Test by sending a message

## 5. Important Notes

### For Production:
- Always use HTTPS (required for service workers)
- VAPID keys must match between frontend and backend
- Store private key securely in backend environment variables

### Android Specific:
- Chrome for Android supports push notifications
- Users must add the PWA to home screen for best experience
- Notifications will appear in Android notification tray like WhatsApp

### Troubleshooting:
- Check browser console for errors
- Ensure service worker is registered: `chrome://serviceworker-internals/`
- Verify notification permission is granted
- Make sure VAPID keys are correctly configured

## 6. Testing Without Backend

For testing purposes, you can manually trigger notifications from browser console:

```javascript
// Get current subscription
const registration = await navigator.serviceWorker.ready
const subscription = await registration.pushManager.getSubscription()
console.log(JSON.stringify(subscription))

// Use this subscription object to test push from backend
```
