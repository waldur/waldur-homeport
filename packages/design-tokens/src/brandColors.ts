import { colorLightness, hexToRgb } from './colorMath';
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

export const generateBrandColors = (color: string) => {
  const luminanceValues = {
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

  const brandColors: Record<string, string> = {};
  Object.keys(luminanceValues).forEach((key) => {
    const luminance = luminanceValues[key];
    let _color: string;
    if (color === DEFAULT_PRIMARY_COLORS[600]) {
      _color = DEFAULT_PRIMARY_COLORS[key];
    } else {
      _color = Number(key) === 600 ? color : colorLightness(color, luminance);
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
