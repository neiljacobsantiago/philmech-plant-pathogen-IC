import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PhilMech Plant Pathogen IC',
        short_name: 'PICS',
        theme_color: '#006b3f',
        icons: [
          { src: '/appLogo.png', sizes: '192x192', type: 'image/png' },
          { src: '/appLogo.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
});