import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Cambia __dirname por import.meta.dirname
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})