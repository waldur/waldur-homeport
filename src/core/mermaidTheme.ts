import { BrandStep, getBrandVar, getCssVar } from 'waldur-design-tokens';

/**
 * Which step of the gray ramp each diagram role reads. Both ramps are physical
 * (step 900 is dark in either theme): dark UI reads `gray-dark`, light UI reads
 * `gray`, the same split the semantic tokens use (docs/design-tokens.md). In
 * dark mode text is therefore a LOW step (100 is light) and fills a high one
 * (800 is dark); it was once read from the inverted SCSS table by its light-mode
 * number, which drew near-black labels on dark green nodes.
 */
const GRAY_STEPS = {
  light: {
    primaryText: 800,
    text: 700,
    line: 400,
    tertiary: 100,
    note: 50,
    border: 300,
  },
  dark: {
    primaryText: 100,
    text: 200,
    line: 500,
    tertiary: 700,
    note: 800,
    border: 600,
  },
};

/**
 * Which step of the brand ramp each diagram role reads. The ramp is physical
 * too (900 is dark), and dark mode takes the mirrored step: light 100 is dark
 * 800, light 200 is dark 700, and so on.
 */
const BRAND_STEPS: Record<
  'light' | 'dark',
  Record<
    'fill' | 'border' | 'secondaryFill' | 'secondaryBorder' | 'clusterBorder',
    BrandStep
  >
> = {
  light: {
    fill: 100,
    border: 400,
    secondaryFill: 50,
    secondaryBorder: 200,
    clusterBorder: 300,
  },
  dark: {
    fill: 800,
    border: 500,
    secondaryFill: 900,
    secondaryBorder: 700,
    clusterBorder: 600,
  },
};

/**
 * Mermaid `themeVariables` for the current theme, read from the theme's CSS
 * variables: the grays from the ramps (`--color-gray-N`, `--color-gray-dark-N`,
 * always present because the ramps are `@theme static`), the brand colours from
 * `--waldur-brand-N` and the diagram background from `--surface-card-bg`. Mermaid draws SVG from plain values, so
 * it cannot take `var()` and has to be given resolved colours.
 */
export function getMermaidThemeVariables(isDarkMode: boolean) {
  const steps = isDarkMode ? GRAY_STEPS.dark : GRAY_STEPS.light;
  const gray = (role: keyof typeof GRAY_STEPS.light) =>
    getCssVar(`--color-gray${isDarkMode ? '-dark' : ''}-${steps[role]}`);

  const brandSteps = isDarkMode ? BRAND_STEPS.dark : BRAND_STEPS.light;
  const brand = (role: keyof typeof BRAND_STEPS.light) =>
    getBrandVar(brandSteps[role]);
  const primaryColor = brand('fill');
  const primaryBorderColor = brand('border');
  const secondaryColor = brand('secondaryFill');
  const secondaryBorderColor = brand('secondaryBorder');
  const clusterBorderColor = brand('clusterBorder');

  // Text colors
  const primaryTextColor = gray('primaryText');
  const textColor = gray('text');
  const lineColor = gray('line');

  // Background colors
  const tertiaryColor = gray('tertiary');
  const backgroundColor = getCssVar('--surface-card-bg');
  const noteBkgColor = gray('note');
  const noteBorderColor = gray('border');

  return {
    // Dark mode flag
    darkMode: isDarkMode,

    // Core colors matching Waldur brand
    primaryColor,
    primaryBorderColor,
    primaryTextColor,
    secondaryColor,
    secondaryBorderColor,
    secondaryTextColor: primaryTextColor,
    tertiaryColor,
    tertiaryBorderColor: noteBorderColor,
    tertiaryTextColor: textColor,

    // Text and lines
    lineColor,
    textColor,

    // Background
    background: backgroundColor,
    mainBkg: primaryColor,

    // Flowchart specific
    nodeBorder: primaryBorderColor,
    clusterBkg: secondaryColor,
    clusterBorder: clusterBorderColor,
    defaultLinkColor: lineColor,

    // State diagram specific
    labelColor: textColor,
    altBackground: tertiaryColor,

    // Notes
    noteBkgColor,
    noteTextColor: textColor,
    noteBorderColor,

    // Font
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };
}
