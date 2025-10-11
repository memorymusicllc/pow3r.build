import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@pow3r/search-ui': path.resolve(__dirname, './pow3r-search-ui/src'),
      '@pow3r/graph': path.resolve(__dirname, './pow3r-graph/src'),
      'three': 'three',
      'three/addons': path.resolve(__dirname, './node_modules/three/examples/jsm')
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      external: [
        '@react-three/fiber',
        '@react-three/drei',
        'reactflow'
      ]
    }
  },
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    exclude: [
      '@react-three/fiber',
      '@react-three/drei',
      'reactflow'
    ]
  }
});
