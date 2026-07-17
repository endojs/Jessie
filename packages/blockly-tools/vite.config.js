import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: 'public',
  publicDir: false,
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '/src': resolve(__dirname, 'src'),
    },
  },
});
