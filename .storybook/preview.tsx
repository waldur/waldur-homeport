import type { Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import { sb } from 'storybook/test';

import { generateBrandColors, hexToRgb } from 'waldur-design-tokens';

import { getBrandColor } from '@/core/utils';
import { loadTheme } from '@/theme/utils';

import '../src/tailwind.css';

// Redirects @/core/api to src/core/__mocks__/api.ts: same API, fixture icons.
sb.mock(import('../src/core/api.ts'));

/**
 * Seeds --waldur-brand-* the same way afterBootstrap.tsx's
 * initCssVariables() does at real app load — every story needs this since
 * Storybook never runs the real app's bootstrap path. See
 * docs/tailwind-shadcn-migration-notes.md.
 */
function seedBrandVars() {
  const hex = getBrandColor();
  document.documentElement.style.setProperty('--waldur-brand-color', hex);
  document.documentElement.style.setProperty(
    '--waldur-brand-color-rgb',
    hexToRgb(hex),
  );
  Object.entries(generateBrandColors(hex)).forEach(([key, color]) => {
    document.documentElement.style.setProperty(`--waldur-brand-${key}`, color);
  });
}

/**
 * loadTheme() (src/theme/utils.ts) both swaps the compiled Metronic
 * stylesheet AND sets data-theme on <html> — reusing it directly, rather
 * than reimplementing a Tailwind-only data-theme toggle, means BaseButton
 * (old) stories get correctly-themed Bootstrap CSS too, not just
 * BaseButtonTw's Tailwind dark: variant.
 */
const withTheme = (Story, context) => {
  useEffect(() => {
    seedBrandVars();
  }, []);
  useEffect(() => {
    loadTheme(context.globals.theme ?? 'light');
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
          ['Colors', 'Typography', 'Elevation'],
          'Actions',
          ['BaseButton', 'CopyButton'],
          'Forms',
          ['Select', 'Switch'],
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
      description: "Theme (mirrors the real app's light/dark stylesheet swap)",
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
