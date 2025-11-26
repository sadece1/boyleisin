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
    // Prevent multiple React instances (fixes "Cannot set properties of undefined" error)
    dedupe: ['react', 'react-dom'],
  },
  build: {
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunks for better caching - improved to prevent initialization errors
        manualChunks: (id) => {
          // React core - must be together to prevent initialization errors
          if (
            id.includes('node_modules/react/') || 
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react/jsx-runtime') ||
            id.includes('node_modules/react/jsx-dev-runtime')
          ) {
            return 'react-vendor';
          }
          // React Router - keep with React to avoid circular dependencies
          if (id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          // UI library chunk
          if (id.includes('node_modules/framer-motion')) {
            return 'ui-vendor';
          }
          // Form libraries
          if (id.includes('node_modules/react-hook-form')) {
            return 'form-vendor';
          }
          // HTTP client
          if (id.includes('node_modules/axios')) {
            return 'http-vendor';
          }
          // State management
          if (id.includes('node_modules/zustand')) {
            return 'state-vendor';
          }
          // Other large libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Minification - use esbuild for better compatibility
    minify: 'esbuild', // Changed from terser to esbuild for better compatibility
    // terserOptions removed - using esbuild instead
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable websocket proxy
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.error('⚠️  Backend proxy error:', err.message);
            console.log('💡 Backend sunucusu çalışmıyor! Backend\'i başlatmak için:');
            console.log('   1. Yeni bir terminal açın');
            console.log('   2. cd server');
            console.log('   3. npm run dev');
          });
        },
      },
    },
  },
})

