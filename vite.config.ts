import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

const certDir = path.resolve(__dirname, 'certs');
const keyPath = path.join(certDir, 'localhost+2-key.pem');
const certPath = path.join(certDir, 'localhost+2.pem');
const httpsConfig = fs.existsSync(keyPath) && fs.existsSync(certPath)
  ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
  : undefined;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      workbox: {
        // Default only precaches js/css/html — the model files (.json/.bin)
        // and bundled images (.png) were silently excluded, which is why
        // offline broke exactly at "Analyze" and on the logo, and nowhere else.
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2,json,bin}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // weights.bin can exceed the 2MB default
      },
      manifest: {
        name: 'PathoScan',
        short_name: 'PathoScan',
        theme_color: '#006837',
        background_color: '#006837',
        display: 'standalone',
        icons: [
          { src: '/appLogo.png', sizes: '192x192', type: 'image/png' },
          { src: '/appLogo.png', sizes: '512x512', type: 'image/png' },
          { src: '/appLogo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
  server: {
    https: httpsConfig,
  },
  preview: {
    https: httpsConfig,
  },
});