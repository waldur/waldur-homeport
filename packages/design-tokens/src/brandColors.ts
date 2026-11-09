import { colorLightness, hexToRgb, hslLightness } from './colorMath';
import { readableOn } from './contrast';

// Waldur's default green brand palette — used both as the out-of-the-box
// brand color and as the pre-computed ramp returned when the tenant hasn't
// overridden it (see generateBrandColors below).
export const DEFAULT_PRIMARY_COLORS = {
  25: '#fafcf9',
  50: '#f1f7ef',
  100: '#e6f0e3',
  200: '#c3dabb',
  300: '#97bf89',
  400: '#6ca359',
  500: '#398500',
  600: '#307300',
  700: '#286100',
  800: '#1f5000',
  900: '#174000',
  950: '#103000',
};

// Lightness of each step for a brand color sitting at 0.4.
const LIGHTNESS_LADDER = {
  25: 0.97,
  50: 0.93,
  100: 0.83,
  200: 0.74,
  300: 0.67,
  400: 0.6,
  500: 0.55,
  600: 0.4,
  700: 0.36,
  800: 0.25,
  900: 0.14,
  950: 0.07,
};

const LADDER_BASE = LIGHTNESS_LADDER[600];
const LADDER_TOP = LIGHTNESS_LADDER[25];

// The fixed ladder flips for brands far from 0.4: a dark brand got a lighter
// hover (700) than its default (600). Steps below 600 are kept at least as
// dark as the brand scaled down, and steps above at least as light as the
// brand scaled up, so the ramp always runs light to dark.
const stepLightness = (step: number, base: number) =>
  step < LADDER_BASE
    ? Math.min(step, base * (step / LADDER_BASE))
    : Math.max(
        step,
        base +
          ((step - LADDER_BASE) / (LADDER_TOP - LADDER_BASE)) *
            Math.max(0, LADDER_TOP - base),
      );

export const generateBrandColors = (color: string) => {
  const base = hslLightness(color);
  const brandColors: Record<string, string> = {};
  Object.keys(LIGHTNESS_LADDER).forEach((key) => {
    let _color: string;
    if (color === DEFAULT_PRIMARY_COLORS[600]) {
      _color = DEFAULT_PRIMARY_COLORS[key];
    } else {
      _color =
        Number(key) === 600
          ? color
          : colorLightness(color, stepLightness(LIGHTNESS_LADDER[key], base));
    }
    const colorRgb = hexToRgb(_color);
    Object.assign(brandColors, { [key]: _color, [key + '-rgb']: colorRgb });
  });

  // Text on a brand-400 fill (the dark theme's selected date). Black or
  // white, whichever reads: no one colour does across tenant hues, as
  // brand-400 is light for a green or yellow brand and dark for a blue one.
  brandColors['on-400'] = readableOn(brandColors['400']) ?? '#000';

  return brandColors;
};
