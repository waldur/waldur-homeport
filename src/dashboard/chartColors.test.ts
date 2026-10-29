import { afterEach, describe, expect, it } from 'vitest';

import { DEFAULT_PRIMARY_COLORS } from 'waldur-design-tokens';

import {
  getCategoricalColors,
  getChartThemeColors,
  getSaturationRamp,
} from './chartColors';

const root = document.documentElement;

// The ramps are `@theme static`, so on a real page every step is defined; give
// the ones under test distinct values to see which variable each colour reads.
const RAMP_VARS: Record<string, string> = {
  '--color-gray-200': '#000200',
  '--color-gray-300': '#000300',
  '--color-gray-400': '#000400',
  '--color-gray-500': '#000500',
  '--color-gray-900': '#000900',
  '--color-success-600': '#016000',
  '--color-warning-600': '#026000',
  '--color-warning-400': '#024000',
  '--color-error-600': '#036000',
  '--color-info-600': '#046000',
  '--color-blue-300': '#100300',
  '--color-teal-300': '#110300',
  '--color-info-300': '#120300',
  '--color-pink-300': '#130300',
  '--color-indigo-300': '#140300',
  '--color-moss-300': '#150300',
  '--color-rose-300': '#160300',
  '--color-blue-500': '#100500',
  '--color-teal-500': '#110500',
};

const setRamps = () =>
  Object.entries(RAMP_VARS).forEach(([k, v]) => root.style.setProperty(k, v));

afterEach(() => root.removeAttribute('style'));

describe('getChartThemeColors', () => {
  it('reads the status colours from the 600 step of their ramps', () => {
    setRamps();
    const colors = getChartThemeColors();
    expect(colors.success).toBe('#016000');
    expect(colors.warning).toBe('#026000');
    expect(colors.danger).toBe('#036000');
    expect(colors.info).toBe('#046000');
  });

  it('takes the notice from warning-400 and progress from blue-500', () => {
    setRamps();
    const colors = getChartThemeColors();
    expect(colors.notice).toBe('#024000');
    expect(colors.progress).toBe('#100500');
  });

  it('reads label and info colours from the theme tokens', () => {
    root.style.setProperty('--text-secondary', '#700700');
    root.style.setProperty('--text-quaternary', '#500500');
    root.style.setProperty('--status-info-fg', '#600600');
    root.style.setProperty('--status-info-bg', '#050050');
    root.style.setProperty('--bg-quaternary', '#020020');
    const colors = getChartThemeColors();
    expect(colors.textSecondary).toBe('#700700');
    expect(colors.textQuaternary).toBe('#500500');
    expect(colors.infoFg).toBe('#600600');
    expect(colors.infoBg).toBe('#050050');
    expect(colors.remaining).toBe('#020020');
  });

  it('mixes the shadow from --shadow-color at the given opacity', () => {
    root.style.setProperty('--shadow-color', '#102030');
    expect(getChartThemeColors().shadow(0.3)).toBe('rgba(16, 32, 48, 0.3)');
  });

  it('falls back to the gray ramp when a surface token is missing', () => {
    setRamps();
    const colors = getChartThemeColors();
    expect(colors.neutral).toBe('#000300');
    expect(colors.neutralStrong).toBe('#000400');
    expect(colors.track).toBe('#000200');
    expect(colors.muted).toBe('#000500');
    expect(colors.text).toBe('#000900');
    expect(colors.border).toBe('#000200');
  });

  it('prefers the surface token when it is defined', () => {
    setRamps();
    root.style.setProperty('--border-secondary', '#123456');
    expect(getChartThemeColors().border).toBe('#123456');
  });

  it('takes the brand steps from the brand colour', () => {
    const colors = getChartThemeColors();
    expect(colors.brand300).toBe(DEFAULT_PRIMARY_COLORS[300]);
    expect(colors.brand600).toBe(DEFAULT_PRIMARY_COLORS[600]);
  });
});

describe('getSaturationRamp', () => {
  it('takes the early notice from warning-400', () => {
    setRamps();
    expect(getSaturationRamp().notice).toBe('#024000');
  });
});

describe('getCategoricalColors', () => {
  it('is the brand 300 followed by the 300 step of each accent hue', () => {
    setRamps();
    expect(getCategoricalColors()).toEqual([
      DEFAULT_PRIMARY_COLORS[300],
      '#100300',
      '#110300',
      '#120300',
      '#130300',
      '#140300',
      '#150300',
      '#160300',
    ]);
  });

  it('repeats the hues at the 500 step past eight', () => {
    setRamps();
    const colors = getCategoricalColors(11);
    expect(colors).toHaveLength(11);
    expect(colors.slice(8)).toEqual([
      DEFAULT_PRIMARY_COLORS[500],
      '#100500',
      '#110500',
    ]);
  });
});
