// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  base: '/mary-arctic-water-app/', // ✅ Must match GitHub repo name
  
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'assets/icons/*.png'],
      
      manifest: {
        name: 'AquaBiz - Mary Arctic Water',
        short_name: 'AquaBiz',
        description: 'Business management system for Mary Arctic Water',
        theme_color: '#00a8ff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/mary-arctic-water-app/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/mary-arctic-water-app/assets/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/mary-arctic-water-app/assets/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /^https:\/\/bhbdcdohurkumhonkkwq\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 10
            }
          }
        ],
        navigateFallback: '/mary-arctic-water-app/index.html',
        navigateFallbackDenylist: [
          /^\/mary-arctic-water-app\/api\/.*/i,
          /^\/mary-arctic-water-app\/manifest\.json$/i,
          /^\/mary-arctic-water-app\/service-worker\.js$/i
        ]
      },
      
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: '/index.html'
      }
    })
  ],
  
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  
  server: {
    port: 5173,
    open: true
  },
  
  preview: {
    port: 4173,
    open: true
  }
})