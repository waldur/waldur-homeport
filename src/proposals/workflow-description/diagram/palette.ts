import { CSSProperties, useMemo } from 'react';

import { getCssVar } from 'waldur-design-tokens';

import { ThemeName } from '@/theme/types';
import { useTheme } from '@/theme/useTheme';

/**
 * The colours the workflow drawings are made of, by role. The drawings
 * keep them in their own <style> rather than reading the page's CSS, so an
 * exported SVG or PNG looks as the drawing did on screen, in whichever
 * theme it was exported from.
 */
export interface DiagramPalette {
  /** The drawing's canvas. */
  background: string;
  /** Every other lane, and quiet surfaces. */
  backgroundAlt: string;
  /** Lane separators and the time grid. */
  line: string;
  /** Section dividers and the start marker. */
  lineStrong: string;
  /** Names. */
  text: string;
  /** Lane labels. */
  label: string;
  /** Secondary text: details, icons. */
  body: string;
  /** Column headers, tick labels, plain edges. */
  muted: string;
  boxFill: string;
  boxStroke: string;
  disabledFill: string;
  accent: string;
  accentSoft: string;
  /** A light bar, or the step still in progress. */
  accentMid: string;
  accentStrong: string;
  accentText: string;
  condition: string;
  conditionSoft: string;
  conditionText: string;
  negative: string;
  negativeSoft: string;
  negativeMid: string;
  negativeStrong: string;
  negativeText: string;
  warning: string;
  warningSoft: string;
  /** How far past its plan a step runs: none, ≤ 50%, ≤ 100%, ≤ 150%,
   * more. Each step stands out more from the canvas than the last. */
  progress: [string, string, string, string, string];
}

// The token each role reads, per theme. The ramps are physical (900 is dark
// in both themes), so the dark theme reads `gray-dark` and the mirrored step,
// as the Mermaid theme does. The canvas and the alternate lanes are the page
// surfaces, which follow the theme applied to <html>; applyTheme() sets it
// before the re-render, so they always agree with the theme asked for.
// Every soft tint in the dark theme is its ramp's 950 step, and the progress
// scale mirrors the light one, ending on the same warning-700.
const LIGHT: DiagramPalette = {
  background: '--bg-primary',
  backgroundAlt: '--bg-secondary',
  line: '--color-gray-200',
  lineStrong: '--color-gray-700',
  text: '--color-gray-900',
  label: '--color-gray-700',
  body: '--color-gray-600',
  muted: '--color-gray-500',
  boxFill: '--bg-primary',
  boxStroke: '--color-gray-400',
  disabledFill: '--color-gray-100',
  accent: '--color-blue-500',
  accentSoft: '--color-blue-50',
  accentMid: '--color-blue-300',
  accentStrong: '--color-blue-700',
  accentText: '--color-blue-700',
  condition: '--color-purple-500',
  conditionSoft: '--color-purple-50',
  conditionText: '--color-purple-700',
  negative: '--color-error-600',
  negativeSoft: '--color-error-50',
  negativeMid: '--color-error-300',
  negativeStrong: '--color-error-500',
  negativeText: '--color-error-700',
  warning: '--color-warning-600',
  warningSoft: '--color-warning-50',
  progress: [
    '--bg-primary',
    '--color-warning-50',
    '--color-warning-100',
    '--color-warning-200',
    '--color-warning-400',
  ],
};

const DARK: DiagramPalette = {
  background: '--bg-primary',
  backgroundAlt: '--bg-secondary',
  line: '--color-gray-dark-700',
  lineStrong: '--color-gray-dark-400',
  text: '--color-gray-dark-50',
  label: '--color-gray-dark-200',
  body: '--color-gray-dark-300',
  muted: '--color-gray-dark-400',
  boxFill: '--color-gray-dark-800',
  boxStroke: '--color-gray-dark-600',
  disabledFill: '--color-gray-dark-900',
  accent: '--color-blue-400',
  accentSoft: '--color-blue-950',
  accentMid: '--color-blue-600',
  accentStrong: '--color-blue-300',
  accentText: '--color-blue-200',
  condition: '--color-purple-400',
  conditionSoft: '--color-purple-950',
  conditionText: '--color-purple-300',
  negative: '--color-error-400',
  negativeSoft: '--color-error-950',
  negativeMid: '--color-error-900',
  negativeStrong: '--color-error-500',
  negativeText: '--color-error-300',
  warning: '--color-warning-500',
  warningSoft: '--color-warning-950',
  progress: [
    '--color-gray-dark-800',
    '--color-warning-950',
    '--color-warning-900',
    '--color-warning-800',
    '--color-warning-700',
  ],
};

// The drawings put plain values in their <style>, not var(), so an export
// keeps them; resolve each token now.
const resolve = (tokens: DiagramPalette) =>
  Object.fromEntries(
    Object.entries(tokens).map(([role, token]) => [
      role,
      Array.isArray(token) ? token.map((t) => getCssVar(t)) : getCssVar(token),
    ]),
  ) as unknown as DiagramPalette;

export const diagramPalette = (theme: ThemeName | undefined): DiagramPalette =>
  resolve(theme === 'dark' ? DARK : LIGHT);

/** The palette of the theme on screen. */
export const useDiagramPalette = (): DiagramPalette => {
  const { theme } = useTheme();
  return useMemo(() => diagramPalette(theme), [theme]);
};

/** The palette as CSS variables, for the HTML legends beside a drawing. */
export const paletteVars = (palette: DiagramPalette) =>
  ({
    '--wd-muted': palette.muted,
    '--wd-accent': palette.accent,
    '--wd-condition': palette.condition,
    '--wd-condition-soft': palette.conditionSoft,
    '--wd-negative': palette.negative,
    '--wd-warning': palette.warning,
    '--wd-line': palette.boxStroke,
  }) as CSSProperties;
