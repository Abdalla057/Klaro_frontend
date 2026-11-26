import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 20_000,
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|@remix-run|@radix-ui)[\\/]/,
              priority: 30,
            },
            {
              name: 'charts',
              test: /node_modules[\\/](recharts|d3-|victory-vendor|react-smooth)[\\/]/,
              priority: 20,
            },
            {
              name: 'motion',
              test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/,
              priority: 20,
            },
            {
              name: 'forms',
              test: /node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
              priority: 15,
            },
            {
              name: 'qr',
              test: /node_modules[\\/]@zxing[\\/]/,
              priority: 15,
            },
            {
              name: 'icons',
              test: /node_modules[\\/](lucide-react|react-icons)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})
