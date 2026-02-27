import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.VITE_HOST || '192.168.56.50',  // Listen on all network interfaces
    port: parseInt(process.env.VITE_PORT) || 5173,       // Default Vite port
    strictPort: true  // Fail if port is already in use
  }
})
