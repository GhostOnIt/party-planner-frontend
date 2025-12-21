import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Optimisations pour le développement
  server: {
    hmr: {
      overlay: true,
    },
  },
  // Optimisations pour la production
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // UI libraries (Radix UI)
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // Query library
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            // Charts library
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }
            // Date library
            if (id.includes('date-fns')) {
              return 'date-vendor';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'form-vendor';
            }
            // Other node_modules
            return 'vendor';
          }
          // Split pages into separate chunks
          if (id.includes('/src/pages/')) {
            const pageRegex = /\/src\/pages\/([^/]+)/;
            const pageMatch = pageRegex.exec(id);
            if (pageMatch) {
              const pageName = pageMatch[1];
              // Group auth pages together
              if (pageName === 'auth') {
                return 'auth-pages';
              }
              // Group admin pages together
              if (pageName === 'admin') {
                return 'admin-pages';
              }
              // Group event pages together
              if (pageName === 'events') {
                return 'event-pages';
              }
              // Other pages
              return `page-${pageName}`;
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
    // Optimiser les assets (images)
    assetsInlineLimit: 4096, // Inline les assets < 4KB, sinon fichiers séparés
  },
  // Optimiser les dépendances
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
