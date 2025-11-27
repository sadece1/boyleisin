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
    // Tree shaking and dead code elimination
    rollupOptions: {
      output: {
        // Manual chunk splitting for better tree shaking and code splitting
        // Separate large libraries into their own chunks for better caching
        manualChunks: (id) => {
          // Separate node_modules into vendor chunks
          if (id.includes('node_modules')) {
            // Framer Motion - large animation library, separate chunk
            if (id.includes('framer-motion')) {
              return 'vendor-framer-motion';
            }
            // React and React DOM - core dependencies
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Other vendor libraries
            return 'vendor';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
      // Aggressive tree shaking for unused code elimination
      treeshake: {
        moduleSideEffects: false, // Assume no side effects for better tree shaking
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    // Minification - use esbuild for better compatibility and tree shaking
    minify: 'esbuild',
    // Source maps disabled for production (reduces bundle size)
    sourcemap: false,
    // Report compressed size
    reportCompressedSize: true,
    // Target modern browsers for smaller bundle (ES2020+)
    target: 'es2020',
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
          proxy.on('error', (err, _req, _res) => {
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

