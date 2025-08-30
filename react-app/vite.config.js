import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // CHANGE THIS BACK TO 'dist'. This is the standard.
    outDir: '../build',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      //input: 'src/main.jsx',
      input: {
        frontend: 'src/main.jsx',      // ফ্রন্টএন্ড অ্যাপ
        admin: 'admin/main.jsx', // অ্যাডমিন অ্যাপ
      },
    },
  },
  // We don't need the server block for this production-only setup.
});