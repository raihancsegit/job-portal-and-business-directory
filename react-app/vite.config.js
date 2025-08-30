import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // CHANGE THIS BACK TO 'dist'. This is the standard.
    outDir: 'dist', 
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: 'src/main.jsx',
    },
  },
  // We don't need the server block for this production-only setup.
});