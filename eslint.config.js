// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import eslint from '@eslint/js';
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

const RESTRICTED_IMPORTS = [
  {
    name: 'react-bootstrap',
    message:
      'react-bootstrap is retired. Use Tailwind CSS and waldur-ui components.',
  },
  // lodash-es is retired; es-toolkit replaced it.
  {
    name: 'lodash-es',
    message:
      'lodash-es is retired. Use native code, or es-toolkit / es-toolkit/compat where lodash semantics matter.',
  },
];

// Menus and popovers are built from waldur-ui's Menu / MenuPopover (see
// docs/menus.md), which wrap these Radix packages with the app's looks and
// defaults. Only packages/ui may import them directly.
const RADIX_MENU_IMPORTS = [
  {
    name: '@radix-ui/react-dropdown-menu',
    message:
      'Use Menu from "waldur-ui" (or ActionsMenu / ActionsDropdown from "@/table/ActionsDropdown" for action menus) instead of @radix-ui/react-dropdown-menu. See docs/menus.md.',
  },
  {
    name: '@radix-ui/react-popover',
    message:
      'Use MenuPopover (or Popover) from "waldur-ui" instead of @radix-ui/react-popover. See docs/menus.md.',
  },
];

// Classes that style nothing on purpose: selectors the end-to-end suite in
// waldur-integration-testing (tests/components, tests/pages) depends on, so
// waldur-custom/no-unknown-class must not report them. Prefer a data-testid
// for a new hook; remove an entry here only together with its selector there.
const UNKNOWN_CLASS_HOOKS = [
  // react-select's BEM names, kept by waldur-ui's Select (tailwindStyles.ts)
  // for tests/components/select.py and a few stylesheets.
  '^metronic-select(?:-container|__[\\w-]+)$',
  // The call workflow's SVG diagrams (proposals/workflow-description/diagram)
  // style these through the <style> element each one renders, which no
  // stylesheet the rule reads can see.
  '^(?:wd|wg|pg)-[\\w-]+$',
  // Marks a disabled step's row for the role and notification matrices'
  // tests; its badge, not a style, tells the user.
  '^step-row--disabled$',
];

export default tseslint
  .config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    jsxA11yPlugin.flatConfigs.recommended,
    ...storybook.configs['flat/recommended'],
    {
      files: ['**/*.{js,ts,tsx}'],
      plugins: {
        '@typescript-eslint': tseslint.plugin,
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
        'waldur-custom/no-manual-icon-colors-in-badges': 'error',
        'waldur-custom/enforce-badge-right-icon-pattern': 'error',
        // Raw <table> markup becomes Table, SimpleTable, PropertyList or, for
        // a form grid, allow-listed waldur-ui Table primitives (decision tree:
        // docs/table/migration-guide.md).
        'waldur-custom/no-hand-rolled-table': 'error',
        'waldur-custom/no-hand-rolled-modal-footer': 'error',
        // Zero instances remain: every native date/time input was replaced by
        // the waldur-ui pickers. See the rule's docblock.
        'waldur-custom/no-native-date-input': 'error',
        // Zero instances remain: inline code and keys are waldur-ui's Code
        // and Kbd, and nothing styles a bare <code> any more.
        'waldur-custom/no-raw-code-element': 'error',
        'waldur-custom/enforce-dialog-button-order': 'error',
        'waldur-custom/no-direct-client-usage': 'error',
        'waldur-custom/no-edit-button-size-override': 'error',
        // A FormLabel outside a FormField names no control: use FormFieldset +
        // FormLegend for a group, FormHeading for a caption.
        'waldur-custom/no-orphan-form-label': 'error',
        // A PropertyItem outside a PropertyList is a one-row <dl> of its own;
        // the wrappers render their children inside a list. Zero instances
        // remain.
        'waldur-custom/property-item-in-list': [
          'error',
          {
            wrappers: [
              'ExpandableContainer[asTable]',
              'TabbedSection.Tab[!plain]',
              'BaseCredentialsSection',
              'BaseProvisioningConfigSection',
            ],
          },
        ],
        // A PropertyList must not contain only a single, lone property item.
        // For a single item, use direct Tailwind CSS or merge into an adjacent
        // list. A warning while existing single-item lists are converted.
        'waldur-custom/no-lone-property-item-in-list': 'warn',
        // Tailwind's `border` sets only the width: a bare one needs a colour.
        // Autofixes to `border border-secondary`.
        'waldur-custom/require-border-color': 'error',
        // Tailwind's border widths are pixels: `border`, `border-t-2`, not
        // `border-[1px]`.
        'waldur-custom/no-arbitrary-border-width': 'error',
        // State colours come from the status matrix (semantic/status.css);
        // deliberate exceptions carry an eslint-disable with the reason.
        'waldur-custom/no-raw-status-ramp': 'error',
        // A colour token with a utility is written as the utility
        // (text-tertiary, not text-[var(--text-tertiary)]); the table is read
        // from tailwind/theme.css. Autofixes.
        'waldur-custom/prefer-token-utility': 'error',
        // A ramp step, white or a hex is the same colour in both themes: use a
        // semantic utility or give it a dark: partner in the same class list.
        'waldur-custom/require-dark-pair': 'error',
        // Font weight is one scale (font-light … font-bold). Autofixes fw-* classes.
        'waldur-custom/require-weight-scale': 'error',
        // Font size is one pinned scale (text-xs … text-4xl). Autofixes fs-* to Tailwind.
        'waldur-custom/require-font-size-scale': 'error',
        // A class that neither Tailwind nor any stylesheet defines styles
        // nothing — a typo or a leftover.
        'waldur-custom/no-unknown-class': [
          'error',
          { allow: UNKNOWN_CLASS_HOOKS },
        ],
        // Hard-coded colours beyond a file's count in
        // scripts/color-literals.baseline.json (the `yarn colors:check` ratchet).
        'waldur-custom/no-literal-color': 'error',
        // rem lengths beyond a file's count in
        // scripts/rem-literals.baseline.json (the `yarn rem:check` ratchet).
        'waldur-custom/no-rem-length': 'error',
        // A style={{ … }} whose every value is a literal is a class in
        // disguise, and outranks every stylesheet while it stays inline.
        // How the existing ones were retired:
        // docs/inline-style-retirement-plan.md.
        'waldur-custom/no-static-inline-style': 'error',
        'waldur-custom/no-interactive-in-tab-trigger': 'error',
        'waldur-custom/check-needs-accessible-name': 'error',
        'waldur-custom/icon-button-needs-accessible-name': 'error',
        // Existing call sites are migrated to HelpIcon incrementally; promote to
        // 'error' once the count is zero.
        'waldur-custom/no-tooltip-on-bare-icon': 'warn',
        'waldur-custom/enforce-phosphor-icon-weight': 'error',
        'waldur-custom/prefer-classnames-utility': 'error',
        'waldur-custom/enforce-render-field-or-dash': 'error',
        // A PropertyItem formatting its value by hand should be the typed
        // property for it (src/property/propertyFields.tsx).
        'waldur-custom/prefer-typed-property': 'error',
        'waldur-custom/prefer-mutate-over-mutateAsync': 'warn',
        'waldur-custom/no-direct-field-adapter': 'error',
        'waldur-custom/enforce-disabled-button-tooltip': 'error',
        'waldur-custom/enforce-noresult-with-cta': 'error',

        // Design system rules
        'waldur-custom/enforce-featured-icon': 'error',
        'waldur-custom/enforce-border-radius-tokens': 'error',
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
        // waldur-ui's Checkbox, Radio and Switch render a native <input>, so a
        // <label> wrapping one is labelled the same as one wrapping <input>.
        'jsx-a11y/label-has-associated-control': [
          'error',
          { controlComponents: ['Checkbox', 'Radio', 'Switch'] },
        ],
        'no-restricted-globals': [
          'error',
          {
            name: 'close',
          },
        ],
        'no-restricted-imports': [
          'error',
          {
            paths: [...RESTRICTED_IMPORTS, ...RADIX_MENU_IMPORTS],
          },
        ],
      },
    },
    {
      // Route definitions only: other objects with a `url` (API paths such as
      // `…?q=…`) are not UI-Router states.
      files: ['src/**/*routes*.ts'],
      ignores: ['**/*.test.ts'],
      rules: {
        'waldur-custom/dynamic-tab-params': 'error',
      },
    },
    {
      // Off elsewhere until its existing violations are fixed. Homeport's
      // tests run without React's hook-order check, so a hook after an early
      // return passes them and only breaks in the browser. Test files are
      // left out: hooks called inside vi.mock factories trip the rule.
      files: ['src/matrix/**/*.{ts,tsx}'],
      ignores: ['**/*.test.{ts,tsx}'],
      rules: {
        'react-hooks/rules-of-hooks': 'error',
      },
    },
    {
      // Off in tests. jsdom loads no stylesheet, so an inline style is the
      // only declaration that reaches the element: a fixture that needs a
      // real width, or a click to land, has to set one, and the lint rules'
      // own fixtures exist to be reported. Converting them breaks the test
      // rather than the styling, which no linter would catch.
      files: ['**/*.test.{ts,tsx}'],
      rules: {
        'waldur-custom/no-static-inline-style': 'off',
      },
    },
    {
      // The table is a package (waldur-table) that micro-apps use too
      // (docs/micro-apps.md), so it reads nothing of the portal's: shared code
      // comes from the other packages, and what only an app has (its router,
      // its crash message) through `TableHost` (packages/table/src/host.tsx).
      // Left out: tests, stories and their support, which run inside homeport
      // and use its test harness and a few of its components.
      files: ['packages/table/src/**/*.{ts,tsx}'],
      ignores: [
        '**/*.test.{ts,tsx}',
        '**/*.stories.tsx',
        'packages/table/src/storyFixtures.tsx',
        'packages/table/src/storyProviders.tsx',
        'packages/table/src/testUtils.tsx',
        'packages/table/src/test-utils.tsx',
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [...RESTRICTED_IMPORTS, ...RADIX_MENU_IMPORTS],
            patterns: [
              {
                regex: '^@/',
                message:
                  'waldur-table imports nothing from the portal: take it from a package, or add it to TableHost (packages/table/src/host.tsx).',
              },
              {
                regex: '^@uirouter/',
                message:
                  'The table knows no router: go through TableHost (packages/table/src/host.tsx).',
              },
            ],
          },
        ],
      },
    },
    {
      // waldur-ui is where Menu and MenuPopover wrap Radix.
      files: ['packages/ui/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: RESTRICTED_IMPORTS,
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
        'vite-plugin-react-displayname.js',
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
      // Node build scripts inside the workspace packages.
      files: ['packages/*/scripts/**/*.mjs'],
      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
      rules: {
        'no-console': 'off',
      },
    },
    {
      // Tests assert class names (toHaveClass('ring-brand-50'), RuleTester
      // fixtures); nothing there is rendered.
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'waldur-custom/require-dark-pair': 'off',
        'waldur-custom/require-weight-scale': 'off',
        'waldur-custom/require-font-size-scale': 'off',
        // Tests pass made-up classes to check they are forwarded.
        'waldur-custom/no-unknown-class': 'off',
        'waldur-custom/no-lone-property-item-in-list': 'off',
      },
    },
    {
      // A standalone app has its own Tailwind entry point.
      files: ['apps/micro-app-poc/**/*.{ts,tsx}'],
      rules: {
        'waldur-custom/no-unknown-class': [
          'error',
          {
            entryPoint: 'apps/micro-app-poc/src/tailwind.css',
            allow: UNKNOWN_CLASS_HOOKS,
          },
        ],
      },
    },
    {
      // The rules' own fixtures contain the class lists they flag.
      files: [
        'packages/eslint-plugin-waldur/rules/require-border-color.test.ts',
        'packages/eslint-plugin-waldur/rules/no-arbitrary-border-width.test.ts',
        'packages/eslint-plugin-waldur/rules/no-raw-status-ramp.test.ts',
        'packages/eslint-plugin-waldur/rules/require-font-size-scale.test.ts',
        'packages/eslint-plugin-waldur/rules/enforce-border-radius-tokens.test.ts',
        // The rules themselves (class lists, built names).
        'packages/eslint-plugin-waldur/rules/require-font-size-scale.js',
        'packages/eslint-plugin-waldur/rules/enforce-border-radius-tokens.js',
        'packages/eslint-plugin-waldur/rules/no-raw-status-ramp.js',
        'packages/eslint-plugin-waldur/rules/prefer-token-utility.js',
        'packages/eslint-plugin-waldur/rules/prefer-token-utility.test.ts',
      ],
      rules: {
        'waldur-custom/require-font-size-scale': 'off',
        'waldur-custom/enforce-border-radius-tokens': 'off',
        'waldur-custom/require-border-color': 'off',
        'waldur-custom/no-arbitrary-border-width': 'off',
        'waldur-custom/prefer-token-utility': 'off',
        'waldur-custom/no-raw-status-ramp': 'off',
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
              ...RESTRICTED_IMPORTS,
              ...RADIX_MENU_IMPORTS,
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
