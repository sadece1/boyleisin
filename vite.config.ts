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

