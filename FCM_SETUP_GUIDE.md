# 🔔 Firebase Cloud Messaging (FCM) Setup Guide

This guide will help you configure push notifications for your Help Desk application using Firebase Cloud Messaging. Notifications will work on **Android mobile browsers** and **desktop browsers**.

## 📋 Overview

The application now supports **hybrid notifications**:
- **Android Mobile**: Uses Firebase Cloud Messaging (FCM) for native push notifications
- **Desktop/Windows**: Uses the standard Browser Notification API

## ✅ Prerequisites

1. A Firebase account (free tier is sufficient)
2. A Firebase project
3. Your Help Desk backend running

## 🚀 Step-by-Step Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard:
   - Enter project name (e.g., "Help Desk Notifications")
   - Enable Google Analytics (optional)
   - Accept default settings

### Step 2: Add Web App to Firebase

1. In Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Register your app with a nickname (e.g., "Help Desk Web")
3. Copy the **Firebase configuration** object
4. **Important**: Check the box **"Also set up Firebase Hosting"** if available

### Step 3: Enable Cloud Messaging

1. In Firebase Console, go to **Project Settings** ⚙️
2. Click the **Cloud Messaging** tab
3. Under **Web Push certificates**, you'll find:
   - **Key pair** (auto-generated)
   - **VAPID key** - Click **"Generate key pair"** if not present
4. **Copy the VAPID key** - you'll need this!

### Step 4: Configure Environment Variables

Update your `.env` file with your Firebase credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# VAPID Key from Firebase Cloud Messaging
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
```

**Where to find each value:**
- All values except VAPID key: From the web app setup in Step 2
- VAPID key: From Project Settings → Cloud Messaging → Web Push certificates

### Step 5: Install Dependencies

The Firebase SDK is already installed. If not, run:

```bash
npm install firebase
```

### Step 6: Test FCM Setup

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open the test page:**
   - Navigate to: `http://localhost:5173/fcm-test.html`
   - Or use your network IP: `http://YOUR_IP:5173/fcm-test.html`

3. **Test on Android device:**
   - Make sure your Android phone is on the same network
   - Open the URL in Chrome browser
   - Click **"Enable Notifications"**
   - You should see an FCM token appear

4. **Send a test notification:**
   - Click **"Send Test Notification"**
   - You should see a notification appear!

### Step 7: Backend Integration

Your backend needs to send notifications through Firebase Admin SDK. Here's a basic example:

#### Install Firebase Admin (Backend)

```bash
npm install firebase-admin
```

#### Initialize Firebase Admin (Backend)

```javascript
// backend/services/firebaseService.js
const admin = require('firebase-admin')

// Load service account from Firebase Console
// Go to Project Settings → Service Accounts → Generate New Private Key
const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const sendNotification = async (fcmToken, title, body, data = {}) => {
  try {
    const message = {
      notification: {
        title,
        body
      },
      data,
      token: fcmToken
    }

    const response = await admin.messaging().send(message)
    console.log('Successfully sent notification:', response)
    return response
  } catch (error) {
    console.error('Error sending notification:', error)
    throw error
  }
}

module.exports = { sendNotification }
```

#### Send Notification from API (Backend)

```javascript
// backend/routes/notification.js
router.post('/send-notification', async (req, res) => {
  const { userId, title, body, data } = req.body
  
  // Get user's FCM token from database
  const user = await User.findById(userId)
  
  if (!user.fcmToken) {
    return res.status(400).json({ error: 'User has no FCM token' })
  }
  
  try {
    await sendNotification(user.fcmToken, title, body, data)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### Step 8: Save FCM Token to Backend

When a user enables notifications on their device, save the FCM token to your backend:

```javascript
// Frontend: After getting FCM token
const token = await requestFCMPermission()

if (token) {
  // Send token to your backend
  await axios.post(`${API_URL}/users/save-fcm-token`, {
    userId: user._id,
    fcmToken: token
  }, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  })
}
```

## 🧪 Testing Instructions

### On Android Device:

1. **Access via Network:**
   - Make sure your PC and Android device are on the same WiFi
   - Use your PC's IP address: `http://192.168.x.x:5173`
   
2. **Enable Notifications:**
   - Open the app in Chrome browser
   - Go to Settings or Dashboard
   - Toggle "Push Notifications" ON
   - Accept the permission prompt

3. **Test Notification:**
   - Send a message in the chat
   - You should receive a notification in the Android notification tray
   - The notification will show even when the browser is closed!

### On Desktop:

1. **Enable Notifications:**
   - Click the notification toggle
   - Accept the browser permission

2. **Test Notification:**
   - Send a message
   - You'll see a notification in the top-right corner

## 📱 How It Works

### Android Flow:
1. User clicks "Enable Notifications"
2. App requests FCM token from Firebase
3. Token is saved to localStorage and backend
4. When backend sends notification via Firebase Admin SDK:
   - **Foreground**: App receives message via `onMessage()` listener
   - **Background**: Android system shows notification automatically
5. Notification appears in system tray with sound/vibration

### Desktop Flow:
1. User clicks "Enable Notifications"
2. Browser requests permission via `Notification.requestPermission()`
3. When notification is triggered:
   - Uses Service Worker to display notification
   - Shows in browser's notification area (top-right)

## 🔧 Troubleshooting

### "No FCM token received"
- Check that all environment variables are set correctly
- Verify VAPID key matches Firebase Console
- Ensure you're testing on an Android device (FCM works best on Android)
- Check browser console for errors

### "Notification permission denied"
- Clear browser permissions: Settings → Site Settings → Notifications
- Try in incognito mode
- Reset browser permissions

### "Notifications not showing on Android"
- Make sure Chrome has notification permission in Android settings
- Check that Do Not Disturb mode is off
- Verify Firebase project is properly configured
- Check Android battery optimization isn't blocking Chrome

### Build Errors
If you see module import errors:
```bash
npm install
npm run build
```

## 📊 Files Added/Modified

### New Files:
- `src/services/fcmService.js` - FCM core functionality
- `src/config/firebase.js` - Firebase configuration
- `src/components/NotificationToggle.jsx` - UI toggle for notifications
- `public/fcm-test.html` - Standalone test page

### Modified Files:
- `src/utils/notificationService.js` - Integrated FCM with existing notifications
- `src/stores/socketStore.js` - Setup FCM listener on socket connect
- `.env` - Added Firebase configuration keys

## 🎯 Next Steps

1. **Production Deployment:**
   - Update Firebase allowed domains in Firebase Console
   - Add your production URL to authorized domains
   - Test on production environment

2. **Advanced Features:**
   - Add notification click handlers to open specific conversations
   - Implement notification preferences (mute, sound settings)
   - Add badge count support
   - Create notification history

3. **Analytics:**
   - Enable Firebase Analytics
   - Track notification engagement rates
   - Monitor delivery success

## 📚 Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Web Push Protocol](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Android Notification Reference](https://developer.android.com/guide/topics/ui/notifiers/notifications)

## 🆘 Support

If you encounter issues:
1. Check browser console for error messages
2. Verify all environment variables are correct
3. Test on the standalone test page first (`/fcm-test.html`)
4. Check Firebase Console for delivery reports

---

**Happy Notifying! 🔔✨**
