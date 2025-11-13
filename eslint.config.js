import eslint from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import enforceBadgeIconPatterns from './eslint-rules/enforce-badge-icon-patterns.js';
import enforceButtonVariants from './eslint-rules/enforce-button-variants.js';
import enforceFormcheckComponents from './eslint-rules/enforce-formcheck-components.js';
import enforcePhosphorIconWeight from './eslint-rules/enforce-phosphor-icon-weight.js';
import noTemplateInTranslate from './eslint-rules/no-template-in-translate.js';
import preferClassnamesUtility from './eslint-rules/prefer-classnames-utility.js';

const browserGlobals = {
  ...globals.browser,
  AudioWorkletGlobalScope: false, // this is the default,
};

delete browserGlobals['AudioWorkletGlobalScope '];

export default tseslint
  .config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    jsxA11yPlugin.flatConfigs.recommended,
    {
      files: ['**/*.{js,ts,tsx}'],
      plugins: {
        '@typescript-eslint': tsPlugin,
        react: reactPlugin,
        'react-hooks': reactHooks,
        prettier: prettier,
        import: importPlugin,
        'react-refresh': reactRefresh,
        'waldur-custom': {
          rules: {
            ...noTemplateInTranslate.rules,
            'enforce-badge-icon-patterns': enforceBadgeIconPatterns,
            'enforce-button-variants': enforceButtonVariants,
            'enforce-formcheck-components': enforceFormcheckComponents,
            'enforce-phosphor-icon-weight': enforcePhosphorIconWeight,
            'prefer-classnames-utility': preferClassnamesUtility,
          },
        },
      },
      languageOptions: {
        parserOptions: {
          ecmaVersion: 2020,
        },
        globals: browserGlobals,
      },
      settings: {
        react: {
          version: 'detect',
        },
        'import/resolver': {
          alias: {
            map: [['@waldur', './src']],
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          },
          typescript: {
            paths: './tsconfig.json',
          },
        },
      },
      rules: {
        ...reactHooks.configs.recommended.rules,

        // Custom local rules
        'waldur-custom/no-template-in-translate': 'error',
        'waldur-custom/enforce-badge-icon-patterns': 'error',
        'waldur-custom/enforce-button-variants': 'error',
        'waldur-custom/enforce-formcheck-components': 'error',
        'waldur-custom/enforce-phosphor-icon-weight': 'error',
        'waldur-custom/prefer-classnames-utility': 'error',

        // React Hooks rules
        'react-hooks/rules-of-hooks': 'off',
        'react-hooks/exhaustive-deps': 'off',

        // Existing rules
        'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
        'react/jsx-curly-brace-presence': [
          'error',
          { props: 'never', children: 'never' },
        ],
        'react/self-closing-comp': 'error',
        'react-refresh/only-export-components': [
          'off',
          { allowConstantExport: true },
        ],

        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        'import/order': [
          'error',
          {
            'newlines-between': 'always',
            pathGroups: [
              {
                pattern: '@waldur/**',
                group: 'internal',
                position: 'after',
              },
            ],
            groups: [
              'builtin',
              'external',
              'internal',
              'parent',
              'sibling',
              'index',
            ],
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
          },
        ],
        'no-console': 'error',
        'import/no-named-as-default': 'error',
        'require-await': 'error',
        'jsx-a11y/no-autofocus': ['error', { ignoreNonDOM: true }],
        'no-restricted-globals': [
          'error',
          {
            name: 'close',
          },
        ],
      },
    },
    {
      ignores: [
        'dist/*',
        'node_modules/*',
        '*.fixture.ts',
        'typings.d.ts',
        '.cache-loader',
        'cypress',
        'src/permissions/enums.ts',
        'src/EventsEnums.ts',
        'src/FeaturesEnums.ts',
        'src/SettingsDescription.ts',
        'src/features/FeaturesDescription.ts',
        'src/api',
        '*.spec.tsx',
        '*.spec.ts',
        '*.fixture.tsx',
        'vite-plugin-react-displayname.ts',
      ],
    },
    {
      files: ['locales/tools/**/*.cjs'],
      languageOptions: {
        sourceType: 'script',
        ecmaVersion: 2022,
        globals: {
          ...globals.node,
        },
      },
      rules: {
        'no-console': 'off',
        'no-case-declarations': 'off',
        'no-prototype-builtins': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  )
  .concat(eslintPluginPrettier);
