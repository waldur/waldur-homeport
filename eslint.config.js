import eslint from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import testingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import enforceActionsDropdownInTables from './eslint-rules/enforce-actions-dropdown-in-tables.js';
import enforceBadgeDesignTokens from './eslint-rules/enforce-badge-design-tokens.js';
import enforceBadgeIconPatterns from './eslint-rules/enforce-badge-icon-patterns.js';
import enforceBadgePropsConsistency from './eslint-rules/enforce-badge-props-consistency.js';
import enforceBadgeRightIconPattern from './eslint-rules/enforce-badge-right-icon-pattern.js';
import enforceBorderRadiusTokens from './eslint-rules/enforce-border-radius-tokens.js';
import enforceBreadcrumbColors from './eslint-rules/enforce-breadcrumb-colors.js';
import enforceButtonVariants from './eslint-rules/enforce-button-variants.js';
import enforceDisabledButtonTooltip from './eslint-rules/enforce-disabled-button-tooltip.js';
import enforceFeaturedIcon from './eslint-rules/enforce-featured-icon.js';
import enforceFormcheckComponents from './eslint-rules/enforce-formcheck-components.js';
import enforceNavTabsPattern from './eslint-rules/enforce-nav-tabs-pattern.js';
import enforceNoResultWithCta from './eslint-rules/enforce-noresult-with-cta.js';
import enforcePhosphorIconWeight from './eslint-rules/enforce-phosphor-icon-weight.js';
import enforceRenderFieldOrDash from './eslint-rules/enforce-render-field-or-dash.js';
import noHandRolledTable from './eslint-rules/no-hand-rolled-table.js';
import noDirectBootstrapButton from './eslint-rules/no-direct-bootstrap-button.js';
import noDirectBootstrapDropdownButton from './eslint-rules/no-direct-bootstrap-dropdown-button.js';
import noDirectClientUsage from './eslint-rules/no-direct-client-usage.js';
import noDirectFieldAdapter from './eslint-rules/no-direct-field-adapter.js';
import noEditButtonSizeOverride from './eslint-rules/no-edit-button-size-override.js';
import noManualIconColorsInBadges from './eslint-rules/no-manual-icon-colors-in-badges.js';
import noRedundantViMock from './eslint-rules/no-redundant-vi-mock.js';
import noTemplateInTranslate from './eslint-rules/no-template-in-translate.js';
import preferAlertItem from './eslint-rules/prefer-alert-item.js';
import preferClassnamesUtility from './eslint-rules/prefer-classnames-utility.js';
import preferMutateOverMutateAsync from './eslint-rules/prefer-mutate-over-mutateAsync.js';

// Design system rules

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
            'enforce-actions-dropdown-in-tables':
              enforceActionsDropdownInTables,
            'enforce-badge-icon-patterns': enforceBadgeIconPatterns,
            'enforce-badge-props-consistency': enforceBadgePropsConsistency,
            'enforce-badge-design-tokens': enforceBadgeDesignTokens,
            'no-manual-icon-colors-in-badges': noManualIconColorsInBadges,
            'enforce-badge-right-icon-pattern': enforceBadgeRightIconPattern,
            'enforce-button-variants': enforceButtonVariants,
            'no-direct-bootstrap-button': noDirectBootstrapButton,
            'no-hand-rolled-table': noHandRolledTable,
            'prefer-alert-item': preferAlertItem,
            'no-direct-bootstrap-dropdown-button':
              noDirectBootstrapDropdownButton,
            'no-direct-client-usage': noDirectClientUsage,
            'no-edit-button-size-override': noEditButtonSizeOverride,
            'enforce-formcheck-components': enforceFormcheckComponents,
            'enforce-phosphor-icon-weight': enforcePhosphorIconWeight,
            'prefer-classnames-utility': preferClassnamesUtility,
            'enforce-render-field-or-dash': enforceRenderFieldOrDash,
            'prefer-mutate-over-mutateAsync': preferMutateOverMutateAsync,
            'no-direct-field-adapter': noDirectFieldAdapter,
            'enforce-disabled-button-tooltip': enforceDisabledButtonTooltip,

            // Design system rules
            'enforce-featured-icon': enforceFeaturedIcon,
            'enforce-nav-tabs-pattern': enforceNavTabsPattern,
            'enforce-border-radius-tokens': enforceBorderRadiusTokens,
            'enforce-breadcrumb-colors': enforceBreadcrumbColors,
            'enforce-noresult-with-cta': enforceNoResultWithCta,
            'no-redundant-vi-mock': noRedundantViMock,
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
        'waldur-custom/enforce-actions-dropdown-in-tables': 'warn',
        'waldur-custom/enforce-badge-icon-patterns': 'error',
        'waldur-custom/enforce-badge-props-consistency': 'error',
        'waldur-custom/enforce-badge-design-tokens': 'error',
        'waldur-custom/no-manual-icon-colors-in-badges': 'error',
        'waldur-custom/enforce-badge-right-icon-pattern': 'error',
        'waldur-custom/enforce-button-variants': 'error',
        'waldur-custom/no-direct-bootstrap-button': 'error',
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
        'waldur-custom/enforce-disabled-button-tooltip': 'warn',
        'waldur-custom/enforce-noresult-with-cta': 'warn',

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
