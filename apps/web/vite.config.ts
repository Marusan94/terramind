import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
    open: false,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true
      },
      "/carto-tiles": {
        target: "https://basemaps.cartocdn.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/carto-tiles/, "")
      },
      "/dem-tiles": {
        target: "https://s3.amazonaws.com/elevation-tiles-prod",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dem-tiles/, "")
      }
    }
  }
})
