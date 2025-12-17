import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 路径别名（方便导入文件）
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  // 开发服务器代理（解决后端接口跨域）
  server: {
    port: 8080, // 前端运行端口
    proxy: {
      '/api': {
        target: 'http://localhost:7001', // 后端接口地址（egg.js默认7001）
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})