import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', 
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ts,tsx}'] 
      },
      manifest: {
        name: 'PathoScan',
        short_name: 'FungiScan',
        description: 'Offline localized plant pathogen identification system',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', 
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' 
          }
        ]
      }
    })
  ]
})