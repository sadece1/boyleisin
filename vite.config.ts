import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { cssAsync } from './vite-plugin-css-async'
import { removeConsole } from './vite-plugin-remove-console'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cssAsync(), removeConsole()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Prevent multiple React instances (fixes "Cannot set properties of undefined" error)
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  // Optimize dependencies to prevent multiple React instances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      'react-helmet-async',
      'react-hook-form',
      'framer-motion',
      'axios',
      'zustand',
    ],
    // Force all React-related deps to be pre-bundled together
    force: true,
    esbuildOptions: {
      // Force ESM format to prevent CommonJS issues
      format: 'esm',
      // Remove console.log in production for better tree shaking
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
  },
  build: {
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Tree shaking and dead code elimination
    rollupOptions: {
      output: {
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // Manual chunking for better code splitting
        // Separate large libraries to reduce initial bundle size
        manualChunks: (id) => {
          // React core + React Router + React Helmet - MUST stay together
          // These are tightly coupled and splitting causes "createContext" errors
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react/jsx-runtime') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/react-helmet-async/')) {
            return 'react-vendor';
          }
          
          // GSAP - large animation library, used only in specific pages
          if (id.includes('node_modules/gsap/')) {
            return 'gsap';
          }
          
          // Framer Motion - large animation library
          if (id.includes('node_modules/framer-motion/')) {
            return 'framer-motion';
          }
          
          // Swiper - carousel library
          if (id.includes('node_modules/swiper/')) {
            return 'swiper';
          }
          
          // Form libraries
          if (id.includes('node_modules/react-hook-form/')) {
            return 'form-vendor';
          }
          
          // Other vendor libraries
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
      },
      // Aggressive tree shaking for unused code elimination
      treeshake: {
        moduleSideEffects: false, // Assume no side effects for better tree shaking
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        preset: 'smallest', // Most aggressive tree shaking
      },
      // Force external dependencies to be bundled together
      external: [],
    },
    // Minification - use esbuild for better compatibility and tree shaking
    minify: 'esbuild',
    // Source maps disabled for production (reduces bundle size)
    sourcemap: false,
    // Report compressed size
    reportCompressedSize: true,
    // Target modern browsers for smaller bundles
    target: 'es2015',
    // CSS minification - handled by cssnano in PostCSS for better optimization
    cssMinify: false,
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

