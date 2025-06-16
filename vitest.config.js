import { defineConfig, configDefaults } from 'vitest/config';
import base from './vite.config.js';

export default defineConfig({
  ...base,
  test: {
    exclude: [...configDefaults.exclude, 'register/**']
  }
});
