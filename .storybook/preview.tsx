import type { Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import { sb } from 'storybook/test';

import { initBrandTokens } from 'waldur-design-tokens';

import { ENV } from '@/core/config';
import { getBrandColor } from '@/core/utils';
import { applyTheme } from '@/theme/utils';

// Same order as src/index.tsx: tailwind.css declares the layer order first.
import '../src/tailwind.css';
import '../src/styles/bootstrap/index.scss';

// Redirects @/core/api to src/core/__mocks__/api.ts: same API, fixture icons.
sb.mock(import('../src/core/api.ts'));

/**
 * Seeds brand tokens the same way afterBootstrap.tsx's
 * initCssVariables() does at real app load — every story needs this since
 * Storybook never runs the real app's bootstrap path. See
 * docs/tailwind-shadcn-migration-notes.md.
 */
function seedBrandVars() {
  if (!ENV.plugins?.WALDUR_CORE) {
    ENV.plugins = {
      ...ENV.plugins,
      WALDUR_CORE: {
        SHORT_PAGE_TITLE: 'Waldur',
        FULL_PAGE_TITLE: 'Waldur | Cloud Management Platform',
        ...(ENV.plugins?.WALDUR_CORE || {}),
      },
    } as any;
  }
  initBrandTokens(getBrandColor());
}

/**
 * applyTheme() (src/theme/utils.ts) sets data-theme on <html>, which both
 * the Bootstrap stylesheet imported above and Tailwind's dark: variant key
 * off — the same switch the real app uses.
 */
const withTheme = (Story, context) => {
  useEffect(() => {
    seedBrandVars();
  }, []);
  useEffect(() => {
    applyTheme(context.globals.theme ?? 'light');
  }, [context.globals.theme]);
  return <Story />;
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    options: {
      storySort: {
        order: [
          'Foundations',
          [
            'Colors',
            'Semantic Colors',
            'Typography',
            'Elevation',
            'Layout',
            'Component Tokens',
          ],
          'Actions',
          ['BaseButton', 'CopyButton'],
          'Forms',
          [
            'Layout',
            ['FormGroup', 'FormTable'],
            'Text inputs',
            [
              'Input',
              'Textarea',
              'Input group',
              'Number input',
              'Secret input',
              'Range input',
              'Form fields',
            ],
            'Selection',
            ['Native select', 'Select', 'RoleAndProjectSelectField'],
            'Check controls',
            [
              'Checkbox',
              'Switch',
              'Radio',
              'BoxRadioField',
              'Form fields',
              'Disabled view',
            ],
            'Date & time',
            [
              'Calendar',
              'DatePicker',
              'DateRangePicker',
              'MonthPicker',
              'Form fields',
            ],
            'Edit fields',
          ],
          'Feedback',
          ['AlertItem', 'LoadingSpinner'],
          'Data Display',
          [
            'Badge',
            'StatusPill',
            'Avatar',
            'FeaturedIcon',
            'Card',
            'StatCard',
            'Table',
            'DataTable',
            'MermaidChart',
          ],
          'Overlays',
          ['Tooltip', 'Popover', 'DropdownMenu', 'Dialog', 'Sheet'],
          'Navigation',
          [
            'TopBar',
            'Sidebar',
            'ModePicker',
            'LanguageMenu',
            'ActionsDropdown',
          ],
          'Migration',
          ['BaseButton (Legacy)', 'BaseButton Parity', 'StatCard Parity'],
        ],
      },
    },

    // Storybook 10's core viewport feature reads `options` (a Record<string,
    // Viewport>) — not `viewports`, the old addon-viewport (Storybook 6/7)
    // key. With `viewports`, this whole block was silently ignored and the
    // toolbar fell back to its own built-in `MINIMAL_VIEWPORTS` list
    // (Small mobile/Large mobile/Tablet/Desktop) instead, with no error —
    // confirmed by inspecting node_modules/storybook/dist/chunk-*.d.ts's
    // `ViewportParameters` type. Selecting one of these presets is a
    // `globals.viewport` value (e.g. `{ globals: { viewport: 'mobile' } }`
    // on a story/meta), not a `parameters.viewport.defaultViewport` —  that
    // parameter doesn't exist in this version either.
    viewport: {
      options: {
        mobile: {
          name: 'Mobile (xs)',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet (md)',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop (lg)',
          styles: { width: '1024px', height: '768px' },
        },
        widescreen: {
          name: 'Widescreen (xl)',
          styles: { width: '1440px', height: '900px' },
        },
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  globalTypes: {
    theme: {
      description: "Theme (mirrors the real app's light/dark switch)",
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [withTheme],
};
export default preview;
