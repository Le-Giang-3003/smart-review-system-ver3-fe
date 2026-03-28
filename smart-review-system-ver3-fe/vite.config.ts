import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: "/",
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Khớp `dotnet run` mặc định (launch profile "http" → :5221). Profile "https" cũng mở :5221.
        // Nếu chỉ chạy HTTPS trên :7061, đổi target thành https://localhost:7061 (secure: false).
        target: 'http://localhost:5221',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
