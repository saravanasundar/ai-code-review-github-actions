// eslint.config.js
import eslintPluginJs from '@eslint/js';

export default [
  {
    ...eslintPluginJs.configs.recommended,
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'no-unused-vars': 'error',
      'no-console': 'off',
      eqeqeq: 'error',
      curly: 'error'
    },
    ignores: [
      'node_modules/**'
    ]
  }
];