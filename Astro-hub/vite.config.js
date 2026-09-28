// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Official Vite Configuration Reference: https://vite.dev/config/server-options.html
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})