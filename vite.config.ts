import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Vardio',
        short_name: 'Vardio',
        description: 'Akıllı Vardiya ve Bordro Takip Sistemi',
        theme_color: '#4f46e5', // İndigo rengimiz
      }
    })
  ],
})