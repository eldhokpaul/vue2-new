module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020
  },
  plugins: [
    'eslint-plugin-local-rules',
    'simple-import-sort'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'require-await': 'off',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-ignore': true
      }
    ],
    'simple-import-sort/imports': 'error',
    '@typescript-eslint/member-delimiter-style': ['error', {
      multiline: {
        delimiter: 'none',
        requireLast: false
      },
      singleline: {
        delimiter: 'comma',
        requireLast: false
      }
    }],
    '@typescript-eslint/no-explicit-any': 'off',
    'vue/valid-v-slot': ['error', { allowModifiers: true }]
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    },
    {
      files: [
        '*.js',
        '**/*.js'
      ],
      env: {
        node: true
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    },
    {
      files: [
        '*.vue'
      ],
      rules: {
        'local-rules/require-vuex-action-used': 'error',
        'local-rules/require-vuex-mutation-used': 'error',
        'local-rules/require-vuex-state-used': 'error',
        'local-rules/vue-require-computed-used': 'error',
        'local-rules/vue-require-methods-used': 'error'
      }
    }
  ]
}
