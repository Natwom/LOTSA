import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',           // change to '/admin/' ONLY if deployed under /admin/ subpath
  server: { port: 5174, host: true }
})