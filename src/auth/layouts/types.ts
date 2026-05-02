import { translate } from '@/i18n';

export type LandingPageLayout =
  // Original layouts
  | 'split-screen'
  | 'centered-card'
  | 'minimal'
  | 'full-hero'
  | 'gradient'
  | 'stacked'
  // Visual/Background layouts
  | 'right-split'
  | 'glassmorphism'
  | 'neumorphism'
  | 'animated-gradient'
  | 'video-background'
  // Layout Structure layouts
  | 'bottom-sheet'
  | 'tabbed'
  | 'wizard'
  // Content-Rich layouts
  | 'stats'
  | 'news'
  | 'carousel'
  // Brand-Heavy layouts
  | 'logo-watermark'
  | 'brand-pattern'
  | 'duotone'
  | 'diagonal'
  // Dynamic layouts
  | 'time-based'
  | 'seasonal'
  | 'weather';

export const LAYOUT_OPTIONS: Array<{
  value: LandingPageLayout;
  label: string;
  category: string;
}> = [
  // Original
  {
    value: 'split-screen',
    label: translate('Split Screen'),
    category: 'Classic',
  },
  {
    value: 'centered-card',
    label: translate('Centered Card'),
    category: 'Classic',
  },
  { value: 'minimal', label: translate('Minimal'), category: 'Classic' },
  {
    value: 'full-hero',
    label: translate('Full Hero Overlay'),
    category: 'Classic',
  },
  {
    value: 'gradient',
    label: translate('Gradient Background'),
    category: 'Classic',
  },
  { value: 'stacked', label: translate('Stacked Hero'), category: 'Classic' },

  // Visual/Background
  { value: 'right-split', label: translate('Right Split'), category: 'Visual' },
  {
    value: 'glassmorphism',
    label: translate('Glassmorphism'),
    category: 'Visual',
  },
  { value: 'neumorphism', label: translate('Neumorphism'), category: 'Visual' },
  {
    value: 'animated-gradient',
    label: translate('Animated Gradient'),
    category: 'Visual',
  },
  {
    value: 'video-background',
    label: translate('Video Background'),
    category: 'Visual',
  },

  // Layout Structure
  {
    value: 'bottom-sheet',
    label: translate('Bottom Sheet'),
    category: 'Structure',
  },
  { value: 'tabbed', label: translate('Tabbed'), category: 'Structure' },
  { value: 'wizard', label: translate('Wizard'), category: 'Structure' },

  // Content-Rich
  { value: 'stats', label: translate('Stats'), category: 'Content' },
  { value: 'news', label: translate('News'), category: 'Content' },
  { value: 'carousel', label: translate('Carousel'), category: 'Content' },

  // Brand-Heavy
  {
    value: 'logo-watermark',
    label: translate('Logo Watermark'),
    category: 'Brand',
  },
  {
    value: 'brand-pattern',
    label: translate('Brand Pattern'),
    category: 'Brand',
  },
  { value: 'duotone', label: translate('Duotone'), category: 'Brand' },
  { value: 'diagonal', label: translate('Diagonal Split'), category: 'Brand' },

  // Dynamic
  { value: 'time-based', label: translate('Time Based'), category: 'Dynamic' },
  { value: 'seasonal', label: translate('Seasonal'), category: 'Dynamic' },
  { value: 'weather', label: translate('Weather'), category: 'Dynamic' },
];

export const DEFAULT_LAYOUT: LandingPageLayout = 'split-screen';
