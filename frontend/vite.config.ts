import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/state': 'http://localhost:5000',
      '/interact': 'http://localhost:5000',
      '/start': 'http://localhost:5000',
      '/assign_tag': 'http://localhost:5000',
      '/tag_config': 'http://localhost:5000',
      '/register_player': 'http://localhost:5000',
      '/debug': 'http://localhost:5000',
    },
  },
})
