// Script to auto-update Firebase authorized domains when ngrok restarts
// Run this after starting ngrok

import fetch from 'node-fetch'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file
const envPath = join(__dirname, '.env')
const envContent = readFileSync(envPath, 'utf-8')

// Get ngrok URL from environment or prompt
const NGROK_URL = process.env.NGROK_URL || 'https://helpdesk-dev.ngrok.io'

// Firebase Admin SDK setup (you need service account)
const admin = require('firebase-admin')

// Load your service account key
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')

if (!serviceAccount.project_id) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT not set or invalid')
  console.log('\n📝 Setup Instructions:')
  console.log('1. Go to Firebase Console → Project Settings → Service Accounts')
  console.log('2. Click "Generate new private key"')
  console.log('3. Save the JSON file')
  console.log('4. Set env variable: FIREBASE_SERVICE_ACCOUNT=\'{...json content...}\'')
  process.exit(1)
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

async function updateAuthorizedDomain() {
  try {
    // Extract domain from ngrok URL
    const domain = NGROK_URL.replace(/^https?:\/\//, '')
    
    console.log(`🔄 Updating Firebase authorized domain...`)
    console.log(`   Domain: ${domain}`)
    
    // Note: Firebase Admin SDK doesn't have direct API for authorized domains
    // You need to use Google Identity Platform API
    // This is a placeholder - you'll need to implement OAuth2 with Google Cloud
    
    console.log(`✅ Domain update would be successful (manual step required)`)
    console.log(`\n⚠️  Manual Step Required:`)
    console.log(`1. Go to: https://console.firebase.google.com/project/${serviceAccount.project_id}/settings/general/`)
    console.log(`2. Scroll to "Authorized domains"`)
    console.log(`3. Add domain: ${domain}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

updateAuthorizedDomain()
