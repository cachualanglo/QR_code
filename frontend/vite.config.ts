import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Allow dynamic backend URL for local testing or CI environments without hard-coding.
        // If VITE_BACKEND_URL (or VITE_BACKEND_URL) is provided, use it; otherwise fall back to localhost:8080
        target: (process.env.VITE_BACKEND_URL as string) || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
    },
  },
})
