import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // tasks-vision ships a non-standard ESM bundle (vision_bundle.mjs) that
    // Vite's optimizer rewrites incorrectly. Skip pre-bundling so it loads
    // directly from node_modules.
    exclude: ['@mediapipe/tasks-vision'],
  },
})
