import { defineConfig } from 'vite';
import monacoEditor from 'vite-plugin-monaco-editor';
const monacoEditorPlugin = monacoEditor.default;
import { resolve, join } from 'path';

export default defineConfig({
  plugins: [
    monacoEditorPlugin({
      customDistPath: (root, outDir) => join(root, outDir, 'monacoeditorwork')
    })
  ],
  // Use a relative base path in production that matches the repository name
  base: process.env.NODE_ENV === 'production' ? '/stage2nd/' : '/',
  define: { global: 'globalThis' },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@components': resolve(__dirname, './src/components'),
      '@modules': resolve(__dirname, './src/modules'),
      '@services': resolve(__dirname, './src/services')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor'],
          vendor: ['localforage', 'eventemitter3']
        }
      }
    }
  },
  worker: {
    format: 'es'
  }
});
