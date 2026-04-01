import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const devPort = Number(process.env.VITE_PORT) || 5173
const hmrHost = process.env.VITE_HMR_HOST

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: devPort,
    strictPort: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    origin: process.env.VITE_ORIGIN,

    // ✅ FIX HMR
    hmr: hmrHost
      ? {
          protocol: 'wss',
          host: hmrHost,
          port: 443,
          clientPort: 443,
          path: '/'
        }
      : {
          protocol: 'ws',
          host: 'localhost',
          port: devPort,
          clientPort: devPort
        },

    allowedHosts: [
      '.ngrok-free.dev'
    ]
  }
})