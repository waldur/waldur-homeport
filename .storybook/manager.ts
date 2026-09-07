import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

const theme = create({
  base: 'light',
  brandTitle: 'Waldur Design System',
  brandUrl: 'https://waldur.com',
  brandTarget: '_blank',

  // UI Brand Accents
  colorPrimary: '#1b84ff',
  colorSecondary: '#1b84ff',

  // UI Chromes
  appBg: '#ffffff',
  appContentBg: '#ffffff',
  appPreviewBg: '#f9fafb',
  appBorderColor: '#e4e7ec',
  appBorderRadius: 8,

  // Typography
  fontBase:
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',

  // Text colors
  textColor: '#101828',
  textInverseColor: '#ffffff',

  // Toolbar & Navigation
  barTextColor: '#475467',
  barSelectedColor: '#1b84ff',
  barHoverColor: '#1b84ff',
  barBg: '#ffffff',

  // Form inputs
  inputBg: '#ffffff',
  inputBorder: '#d0d5dd',
  inputTextColor: '#101828',
  inputBorderRadius: 6,
});

addons.setConfig({
  theme,
  sidebar: {
    showRoots: true,
    collapsedRoots: ['migration'],
  },
});
