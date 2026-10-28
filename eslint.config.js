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
    importNames: ['Badge'],
    message: 'Use Badge from "waldur-ui" instead of react-bootstrap.',
  },
  {
    name: 'react-bootstrap/Badge',
    message: 'Use Badge from "waldur-ui" instead of react-bootstrap/Badge.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['Tooltip'],
    message: 'Use Tooltip from "waldur-ui" instead of react-bootstrap.',
  },
  {
    name: 'react-bootstrap/Tooltip',
    message: 'Use Tooltip from "waldur-ui" instead of react-bootstrap/Tooltip.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['OverlayTrigger'],
    message:
      'Use Tooltip or Popover from "waldur-ui" instead of react-bootstrap/OverlayTrigger.',
  },
  {
    name: 'react-bootstrap/OverlayTrigger',
    message:
      'Use Tooltip or Popover from "waldur-ui" instead of react-bootstrap/OverlayTrigger.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['Popover'],
    message: 'Use Popover from "waldur-ui" instead of react-bootstrap.',
  },
  {
    name: 'react-bootstrap/Popover',
    message: 'Use Popover from "waldur-ui" instead of react-bootstrap/Popover.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['Alert'],
    message: 'Use AlertItem from "waldur-ui" instead of react-bootstrap.',
  },
  {
    name: 'react-bootstrap/Alert',
    message: 'Use AlertItem from "waldur-ui" instead of react-bootstrap/Alert.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['Button'],
    message:
      'Avoid importing Button directly from react-bootstrap. Use Waldur wrapper components instead:\n' +
      '  - BaseButton: the general-purpose wrapper from waldur-ui (page actions, dialogs, icon buttons)\n' +
      '  - SubmitButton: for form submit and action buttons\n' +
      '  - CloseDialogButton: for modal cancel/close buttons',
  },
  {
    name: 'react-bootstrap/Button',
    message:
      'Use BaseButton (or another Waldur wrapper) from "waldur-ui" instead of react-bootstrap/Button.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['DropdownButton'],
    message:
      'Avoid importing DropdownButton from react-bootstrap. Use Menu with Menu.TriggerButton from "waldur-ui" (or ActionsMenu from "@/table/ActionsDropdown") instead.',
  },
  {
    name: 'react-bootstrap/DropdownButton',
    message:
      'Use Menu with Menu.TriggerButton from "waldur-ui" (or ActionsMenu from "@/table/ActionsDropdown") instead of react-bootstrap/DropdownButton.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['Accordion', 'AccordionContext', 'useAccordionButton'],
    message:
      'Use Accordion (a group of panels) or Collapsible (one panel; keepMounted for form fields) from "waldur-ui" instead of react-bootstrap.',
  },
  {
    name: 'react-bootstrap/Accordion',
    message:
      'Use Accordion or Collapsible from "waldur-ui" instead of react-bootstrap/Accordion.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['Pagination', 'PageItem'],
    message:
      'Use TablePagination (or Pagination for the page numbers alone) from "waldur-ui" instead of react-bootstrap. The Bootstrap pagination CSS has been removed.',
  },
  {
    name: 'react-bootstrap/Pagination',
    message:
      'Use TablePagination or Pagination from "waldur-ui" instead of react-bootstrap/Pagination.',
  },
  {
    name: 'react-bootstrap/PageItem',
    message:
      'Use TablePagination or Pagination from "waldur-ui" instead of react-bootstrap/PageItem.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['Stack'],
    message:
      'Use a flex div with Tailwind utilities instead of react-bootstrap/Stack.',
  },
  {
    name: 'react-bootstrap/Stack',
    message:
      'Use a flex div with Tailwind utilities instead of react-bootstrap/Stack.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['Spinner'],
    message:
      'Use LoadingSpinner from "waldur-ui" (or StepLoading from "@/wizard" in wizards) instead of react-bootstrap/Spinner.',
  },
  {
    name: 'react-bootstrap/Spinner',
    message:
      'Use LoadingSpinner from "waldur-ui" (or StepLoading from "@/wizard" in wizards) instead of react-bootstrap/Spinner.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['ListGroup', 'ListGroupItem'],
    message:
      'Use Tailwind lists or specific UI primitives (such as FormTable) instead of react-bootstrap/ListGroup.',
  },
  {
    name: 'react-bootstrap/ListGroup',
    message:
      'Use Tailwind lists or specific UI primitives (such as FormTable) instead of react-bootstrap/ListGroup.',
  },
  {
    name: 'react-bootstrap/ListGroupItem',
    message:
      'Use Tailwind lists or specific UI primitives (such as FormTable) instead of react-bootstrap/ListGroupItem.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['Collapse'],
    message:
      'Use Collapsible from "waldur-ui" instead of react-bootstrap/Collapse.',
  },
  {
    name: 'react-bootstrap/Collapse',
    message:
      'Use Collapsible from "waldur-ui" instead of react-bootstrap/Collapse.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['Form'],
    message: 'Use native <form> instead of react-bootstrap/Form.',
  },
  {
    name: 'react-bootstrap/Form',
    message: 'Use native <form> instead of react-bootstrap/Form.',
  },
  // lodash-es is retired (#455); es-toolkit replaced it.
  {
    name: 'lodash-es',
    message:
      'lodash-es is retired (#455). Use native code, or es-toolkit / es-toolkit/compat where lodash semantics matter.',
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
        // Zero instances remain; see the rule's docblock.
        'waldur-custom/no-bootstrap-button-markup': 'error',
        // Warnings rather than errors: the tree still carries dozens of each,
        // and converting one is a per-screen judgement rather than a mechanical
        // swap. They steer new code; promote to 'error' once the count is down.
        'waldur-custom/no-hand-rolled-table': 'warn',
        'waldur-custom/no-hand-rolled-modal-footer': 'error',
        // Zero instances remain: every native date/time input was replaced by
        // the waldur-ui pickers. See the rule's docblock.
        'waldur-custom/no-native-date-input': 'error',
        'waldur-custom/enforce-dialog-button-order': 'error',
        'waldur-custom/no-direct-client-usage': 'error',
        'waldur-custom/no-edit-button-size-override': 'error',
        // Zero instances remain: every checkbox, radio and switch is a waldur-ui
        // Checkbox/Radio/Switch, and the .form-check styles are deleted.
        'waldur-custom/no-bootstrap-form-check': 'error',
        // Native selects are waldur-ui's NativeSelect; Form.Select and
        // .form-select are going away.
        'waldur-custom/no-bootstrap-form-select': 'error',
        // Text inputs are waldur-ui's Input, Textarea, NumberInput, SecretInput,
        // InputGroup and RangeInput; FormControl, InputGroup and the
        // form-control / input-group classes are going away.
        'waldur-custom/no-bootstrap-form-control': 'error',
        // Zero instances remain: every progress bar is a waldur-ui Progress and
        // the .progress styles are deleted.
        'waldur-custom/no-bootstrap-progress': 'error',
        // react-bootstrap's Stack renders gap={N} as a runtime gap-N class:
        // Tailwind's step, or nothing when no source spells that name.
        'waldur-custom/no-bootstrap-stack-gap': 'error',
        // Zero instances remain: every dialog is waldur-ui's Modal and the
        // .modal / .btn-close styles are deleted.
        'waldur-custom/no-bootstrap-modal': 'error',
        'waldur-custom/no-bootstrap-tabs': 'error',
        // Zero instances remain: layouts are Tailwind grid/flex, and Bootstrap's
        // grid and the .table gutter utilities are no longer compiled.
        'waldur-custom/no-bootstrap-grid': 'error',
        'waldur-custom/no-bootstrap-breadcrumb': 'error',
        // A FormLabel outside a FormField names no control: use FormFieldset +
        // FormLegend for a group, FormHeading for a caption.
        'waldur-custom/no-orphan-form-label': 'error',
        // Bootstrap's .border is !important in an earlier layer, so a Tailwind
        // border colour next to it never paints. Autofixes to border-[1px].
        'waldur-custom/no-bootstrap-border-with-tailwind-color': 'error',
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
        // Font weight is one scale (font-light … font-bold); Bootstrap's fw-*
        // are retired, and their "bold" was 500. Autofixes fw-* classes.
        'waldur-custom/require-weight-scale': 'error',
        // Font size is one pinned scale (text-xs … text-4xl); Bootstrap's fs-*
        // are retired. Autofixes fs-* to Tailwind.
        'waldur-custom/require-font-size-scale': 'error',
        // Bootstrap emits no colour utility any more: its old class names
        // (text-danger, bg-light, border-bottom, …) paint nothing.
        'waldur-custom/no-bootstrap-color-utility': 'error',
        // Bootstrap utilities _utilities.scss no longer generates (unused, or
        // only ever used at the base size) compile to nothing.
        'waldur-custom/no-retired-bootstrap-utility': 'error',
        // A class that neither Tailwind nor any stylesheet defines styles
        // nothing — a typo or a leftover. Existing ones are listed per file
        // in unknown-classes.baseline.json; any other one fails.
        'waldur-custom/no-unknown-class': [
          'error',
          { allow: UNKNOWN_CLASS_HOOKS },
        ],
        // Bootstrap layout utilities (d-*, flex-column, items-*, justify-*, w-100, etc.)
        // have direct Tailwind equivalents. Autofixes to Tailwind.
        'waldur-custom/no-bootstrap-layout-utility': 'error',
        // Zero instances remain: every --bs-* read in TS/TSX is a design token.
        'waldur-custom/no-bootstrap-css-vars': 'error',
        'waldur-custom/no-interactive-in-tab-trigger': 'error',
        'waldur-custom/check-needs-accessible-name': 'error',
        'waldur-custom/icon-button-needs-accessible-name': 'error',
        // Existing call sites are migrated to HelpIcon incrementally; promote to
        // 'error' once the count is zero.
        'waldur-custom/no-tooltip-on-bare-icon': 'warn',
        'waldur-custom/enforce-phosphor-icon-weight': 'error',
        'waldur-custom/prefer-classnames-utility': 'error',
        'waldur-custom/enforce-render-field-or-dash': 'error',
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
        'waldur-custom/no-retired-bootstrap-utility': 'off',
        'waldur-custom/no-bootstrap-layout-utility': 'off',
        // Tests pass made-up classes to check they are forwarded.
        'waldur-custom/no-unknown-class': 'off',
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
      // The rule's own fixtures contain the variables it flags.
      files: [
        'packages/eslint-plugin-waldur/rules/no-bootstrap-css-vars.test.ts',
      ],
      rules: { 'waldur-custom/no-bootstrap-css-vars': 'off' },
    },
    {
      // The rules' own fixtures contain the class lists they flag.
      files: [
        'packages/eslint-plugin-waldur/rules/no-bootstrap-border-with-tailwind-color.test.ts',
        'packages/eslint-plugin-waldur/rules/no-raw-status-ramp.test.ts',
        'packages/eslint-plugin-waldur/rules/no-bootstrap-color-utility.test.ts',
        'packages/eslint-plugin-waldur/rules/no-bootstrap-layout-utility.test.ts',
        'packages/eslint-plugin-waldur/rules/require-font-size-scale.test.ts',
        'packages/eslint-plugin-waldur/rules/enforce-border-radius-tokens.test.ts',
        // The rules themselves (class lists, built names), and the test that
        // checks the list against Bootstrap.
        'packages/eslint-plugin-waldur/rules/no-bootstrap-color-utility.js',
        'packages/eslint-plugin-waldur/rules/no-bootstrap-layout-utility.js',
        'packages/eslint-plugin-waldur/rules/require-font-size-scale.js',
        'packages/eslint-plugin-waldur/rules/enforce-border-radius-tokens.js',
        'packages/eslint-plugin-waldur/rules/no-raw-status-ramp.js',
        'packages/eslint-plugin-waldur/rules/prefer-token-utility.js',
        'packages/eslint-plugin-waldur/rules/prefer-token-utility.test.ts',
        'src/tailwindBootstrapColors.test.ts',
      ],
      rules: {
        'waldur-custom/no-bootstrap-color-utility': 'off',
        'waldur-custom/no-bootstrap-layout-utility': 'off',
        'waldur-custom/require-font-size-scale': 'off',
        'waldur-custom/enforce-border-radius-tokens': 'off',
        'waldur-custom/no-bootstrap-border-with-tailwind-color': 'off',
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
