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
  { value: 'split-screen', label: 'Split Screen', category: 'Classic' },
  { value: 'centered-card', label: 'Centered Card', category: 'Classic' },
  { value: 'minimal', label: 'Minimal', category: 'Classic' },
  { value: 'full-hero', label: 'Full Hero Overlay', category: 'Classic' },
  { value: 'gradient', label: 'Gradient Background', category: 'Classic' },
  { value: 'stacked', label: 'Stacked Hero', category: 'Classic' },

  // Visual/Background
  { value: 'right-split', label: 'Right Split', category: 'Visual' },
  { value: 'glassmorphism', label: 'Glassmorphism', category: 'Visual' },
  { value: 'neumorphism', label: 'Neumorphism', category: 'Visual' },
  {
    value: 'animated-gradient',
    label: 'Animated Gradient',
    category: 'Visual',
  },
  { value: 'video-background', label: 'Video Background', category: 'Visual' },

  // Layout Structure
  { value: 'bottom-sheet', label: 'Bottom Sheet', category: 'Structure' },
  { value: 'tabbed', label: 'Tabbed', category: 'Structure' },
  { value: 'wizard', label: 'Wizard', category: 'Structure' },

  // Content-Rich
  { value: 'stats', label: 'Stats', category: 'Content' },
  { value: 'news', label: 'News', category: 'Content' },
  { value: 'carousel', label: 'Carousel', category: 'Content' },

  // Brand-Heavy
  { value: 'logo-watermark', label: 'Logo Watermark', category: 'Brand' },
  { value: 'brand-pattern', label: 'Brand Pattern', category: 'Brand' },
  { value: 'duotone', label: 'Duotone', category: 'Brand' },
  { value: 'diagonal', label: 'Diagonal Split', category: 'Brand' },

  // Dynamic
  { value: 'time-based', label: 'Time Based', category: 'Dynamic' },
  { value: 'seasonal', label: 'Seasonal', category: 'Dynamic' },
  { value: 'weather', label: 'Weather', category: 'Dynamic' },
];

export const DEFAULT_LAYOUT: LandingPageLayout = 'split-screen';
