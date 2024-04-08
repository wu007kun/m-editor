import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const path = require('path')

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  plugins: [
    vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      three: path.resolve(__dirname, 'packages/src/Three.js')
    }
  },
  build: {
    assetsDir: 'src',
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境时移除console
        drop_console: true,
        drop_debugger: true
      }
    }
  }

})
