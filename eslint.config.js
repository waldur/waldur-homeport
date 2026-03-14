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
import noDirectBootstrapButton from './eslint-rules/no-direct-bootstrap-button.js';
import noDirectBootstrapDropdownButton from './eslint-rules/no-direct-bootstrap-dropdown-button.js';
import noDirectClientUsage from './eslint-rules/no-direct-client-usage.js';
import noEditButtonSizeOverride from './eslint-rules/no-edit-button-size-override.js';
import noManualIconColorsInBadges from './eslint-rules/no-manual-icon-colors-in-badges.js';
import noTemplateInTranslate from './eslint-rules/no-template-in-translate.js';
import preferClassnamesUtility from './eslint-rules/prefer-classnames-utility.js';

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
            'no-direct-bootstrap-dropdown-button':
              noDirectBootstrapDropdownButton,
            'no-direct-client-usage': noDirectClientUsage,
            'no-edit-button-size-override': noEditButtonSizeOverride,
            'enforce-formcheck-components': enforceFormcheckComponents,
            'enforce-phosphor-icon-weight': enforcePhosphorIconWeight,
            'prefer-classnames-utility': preferClassnamesUtility,
            'enforce-render-field-or-dash': enforceRenderFieldOrDash,
            'enforce-disabled-button-tooltip': enforceDisabledButtonTooltip,

            // Design system rules
            'enforce-featured-icon': enforceFeaturedIcon,
            'enforce-nav-tabs-pattern': enforceNavTabsPattern,
            'enforce-border-radius-tokens': enforceBorderRadiusTokens,
            'enforce-breadcrumb-colors': enforceBreadcrumbColors,
            'enforce-noresult-with-cta': enforceNoResultWithCta,
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
        'waldur-custom/enforce-actions-dropdown-in-tables': 'warn',
        'waldur-custom/enforce-badge-icon-patterns': 'error',
        'waldur-custom/enforce-badge-props-consistency': 'error',
        'waldur-custom/enforce-badge-design-tokens': 'error',
        'waldur-custom/no-manual-icon-colors-in-badges': 'error',
        'waldur-custom/enforce-badge-right-icon-pattern': 'error',
        'waldur-custom/enforce-button-variants': 'error',
        'waldur-custom/no-direct-bootstrap-button': 'error',
        'waldur-custom/no-direct-bootstrap-dropdown-button': 'error',
        'waldur-custom/no-direct-client-usage': 'error',
        'waldur-custom/no-edit-button-size-override': 'error',
        'waldur-custom/enforce-formcheck-components': 'error',
        'waldur-custom/enforce-phosphor-icon-weight': 'error',
        'waldur-custom/prefer-classnames-utility': 'error',
        'waldur-custom/enforce-render-field-or-dash': 'error',
        'waldur-custom/enforce-disabled-button-tooltip': 'warn',
        'waldur-custom/enforce-noresult-with-cta': 'warn',

        // Design system rules
        'waldur-custom/enforce-featured-icon': 'error',
        'waldur-custom/enforce-nav-tabs-pattern': 'error',
        'waldur-custom/enforce-border-radius-tokens': 'error',
        'waldur-custom/enforce-breadcrumb-colors': 'error',

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
  )
  .concat(eslintPluginPrettier);
