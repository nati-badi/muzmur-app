const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'node_modules/',
      '.expo/',
      'dist/',
      'web-build/',
      '.expo-export-test/',
      '.expo-export-test2/',
      'src/data/*.json',
      'add_sections.js',
      'scripts/',
    ],
  },
]);