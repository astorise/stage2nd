import { defineConfig } from 'vite';
import monacoEditor from 'vite-plugin-monaco-editor';
const monacoEditorPlugin = monacoEditor.default;
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    monacoEditorPlugin({})
  ],
  base: process.env.NODE_ENV === 'production' ? '/codeplay-core/' : '/',
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
          'monaco': ['monaco-editor'],
          'vendor': ['localforage', 'eventemitter3']
        }
      }
    }
  }
});