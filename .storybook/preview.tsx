import type { Preview } from '@storybook/react-vite';
import { useEffect } from 'react';

import { generateBrandColors, hexToRgb } from 'waldur-design-tokens';

import { getBrandColor } from '@/core/utils';
import { loadTheme } from '@/theme/utils';

import '../src/tailwind.css';

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
