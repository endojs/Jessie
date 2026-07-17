export default [
  {
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
      },
    },
    rules: {
      'func-names': 'off',
      'no-use-before-define': ['error', { functions: false }],
    },
  },
];
