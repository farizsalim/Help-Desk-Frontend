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
    origin: process.env.VITE_ORIGIN,

    hmr: hmrHost
      ? {
          protocol: 'wss',
          host: hmrHost,
          clientPort: 443
        }
      : {
          protocol: 'ws',
          host: 'localhost',
          port: devPort
        },

    allowedHosts: [
      'frontend.helpdesk54321.online'
    ]
  }
})