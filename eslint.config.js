// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import eslint from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import testingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import waldurCustom from 'eslint-plugin-waldur';

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
    ...storybook.configs['flat/recommended'],
    {
      files: ['**/*.{js,ts,tsx}'],
      plugins: {
        '@typescript-eslint': tsPlugin,
        react: reactPlugin,
        'react-hooks': reactHooks,
        prettier: prettier,
        import: importPlugin,
        'react-refresh': reactRefresh,
        'waldur-custom': waldurCustom,
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
            map: [['@', './src']],
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
        'waldur-custom/no-undefined-in-mutation-body': 'warn',
        'waldur-custom/enforce-actions-dropdown-in-tables': 'warn',
        'waldur-custom/enforce-badge-icon-patterns': 'error',
        'waldur-custom/enforce-badge-props-consistency': 'error',
        'waldur-custom/enforce-badge-design-tokens': 'error',
        'waldur-custom/no-manual-icon-colors-in-badges': 'error',
        'waldur-custom/enforce-badge-right-icon-pattern': 'error',
        'waldur-custom/enforce-button-variants': 'error',
        'waldur-custom/no-direct-bootstrap-button': 'error',
        // Warning while the existing hand-rolled buttons are converted; see the
        // rule's docblock. Promote to 'error' once the count reaches zero.
        'waldur-custom/no-bootstrap-button-markup': 'warn',
        // Warnings rather than errors: the tree still carries dozens of each,
        // and converting one is a per-screen judgement rather than a mechanical
        // swap. They steer new code; promote to 'error' once the count is down.
        'waldur-custom/no-hand-rolled-table': 'warn',
        'waldur-custom/prefer-alert-item': 'warn',
        'waldur-custom/no-direct-bootstrap-dropdown-button': 'error',
        'waldur-custom/no-direct-client-usage': 'error',
        'waldur-custom/no-edit-button-size-override': 'error',
        'waldur-custom/enforce-formcheck-components': 'error',
        'waldur-custom/enforce-phosphor-icon-weight': 'error',
        'waldur-custom/prefer-classnames-utility': 'error',
        'waldur-custom/enforce-render-field-or-dash': 'error',
        'waldur-custom/prefer-mutate-over-mutateAsync': 'warn',
        'waldur-custom/no-direct-field-adapter': 'error',
        'waldur-custom/enforce-disabled-button-tooltip': 'error',
        'waldur-custom/enforce-noresult-with-cta': 'error',

        // Design system rules
        'waldur-custom/enforce-featured-icon': 'error',
        'waldur-custom/enforce-nav-tabs-pattern': 'error',
        'waldur-custom/enforce-border-radius-tokens': 'error',
        'waldur-custom/enforce-breadcrumb-colors': 'error',
        'waldur-custom/no-redundant-vi-mock': 'error',

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
                pattern: '@/**',
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
        // 'import/no-named-as-default': 'error',
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
        'e2e',
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
    {
      files: ['**/*.test.{ts,tsx}'],
      ...testingLibrary.configs['flat/react'],
      settings: {
        'testing-library/custom-renders': ['renderWithProviders'],
      },
      rules: {
        'testing-library/no-node-access': 'error',
        'testing-library/no-container': 'error',
        'testing-library/no-render-in-lifecycle': 'error',
        'testing-library/prefer-user-event': 'error',
        'testing-library/prefer-screen-queries': 'error',
        'no-restricted-syntax': [
          'error',
          {
            selector:
              'MemberExpression[object.name="document"][property.name=/^(querySelector|querySelectorAll|getElementById|getElementsByClassName|getElementsByTagName)$/]',
            message:
              'Use screen.getBy... or other Testing Library queries instead of direct document access.',
          },
        ],
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@/i18n',
                importNames: ['translate'],
                message:
                  'Do not use translate() in unit tests. Use raw strings instead.',
              },
            ],
          },
        ],
      },
    },
  )
  .concat(eslintPluginPrettier);
