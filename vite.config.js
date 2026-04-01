import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ensure proper handling of routes in production
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
