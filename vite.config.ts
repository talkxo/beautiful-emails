import { defineConfig } from 'vite';
import { resolve } from 'path';

import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        image: resolve(__dirname, 'image.html'),
      },
    },
  },
});
