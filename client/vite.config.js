import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
/*export default defineConfig({
  plugins: [react()],
  
})*/
export default {
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://musica-server-rzrh.onrender.com', // assuming backend runs on port 5000
    },
  },
};

