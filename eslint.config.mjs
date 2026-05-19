import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/dist-ssr/**',
      '**/build/**',
      '**/coverage/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
  },
  ...pluginVue.configs['flat/essential'],
  {
    files: ['backend/**/*.js'],
    languageOptions: {
      globals: { process: 'readonly', Buffer: 'readonly', console: 'readonly' },
    },
  },
  { files: ['**/*.vue'], rules: { 'vue/multi-word-component-names': 'off' } },
]);
