import { DEFAULT_PRIMARY_COLORS } from './constants';

// Inferno colormap sampled at 256 evenly-spaced points (t = 0/255 .. 255/255).
// Source: d3-scale-chromatic interpolateInferno, pre-computed to remove the runtime dependency.
// prettier-ignore
const INFERNO_LUT = [
  '#000004','#010005','#010106','#010108','#02010a','#02020c','#02020e','#030210',
  '#040312','#040314','#050417','#060419','#07051b','#08051d','#09061f','#0a0722',
  '#0b0724','#0c0826','#0d0829','#0e092b','#10092d','#110a30','#120a32','#140b34',
  '#150b37','#160b39','#180c3c','#190c3e','#1b0c41','#1c0c43','#1e0c45','#1f0c48',
  '#210c4a','#230c4c','#240c4f','#260c51','#280b53','#290b55','#2b0b57','#2d0b59',
  '#2f0a5b','#310a5c','#320a5e','#340a5f','#360961','#380962','#390963','#3b0964',
  '#3d0965','#3e0966','#400a67','#420a68','#440a68','#450a69','#470b6a','#490b6a',
  '#4a0c6b','#4c0c6b','#4d0d6c','#4f0d6c','#510e6c','#520e6d','#540f6d','#550f6d',
  '#57106e','#59106e','#5a116e','#5c126e','#5d126e','#5f136e','#61136e','#62146e',
  '#64156e','#65156e','#67166e','#69166e','#6a176e','#6c186e','#6d186e','#6f196e',
  '#71196e','#721a6e','#741a6e','#751b6e','#771c6d','#781c6d','#7a1d6d','#7c1d6d',
  '#7d1e6d','#7f1e6c','#801f6c','#82206c','#84206b','#85216b','#87216b','#88226a',
  '#8a226a','#8c2369','#8d2369','#8f2469','#902568','#922568','#932667','#952667',
  '#972766','#982766','#9a2865','#9b2964','#9d2964','#9f2a63','#a02a63','#a22b62',
  '#a32c61','#a52c60','#a62d60','#a82e5f','#a92e5e','#ab2f5e','#ad305d','#ae305c',
  '#b0315b','#b1325a','#b3325a','#b43359','#b63458','#b73557','#b93556','#ba3655',
  '#bc3754','#bd3853','#bf3952','#c03a51','#c13a50','#c33b4f','#c43c4e','#c63d4d',
  '#c73e4c','#c83f4b','#ca404a','#cb4149','#cc4248','#ce4347','#cf4446','#d04545',
  '#d24644','#d34743','#d44842','#d54a41','#d74b3f','#d84c3e','#d94d3d','#da4e3c',
  '#db503b','#dd513a','#de5238','#df5337','#e05536','#e15635','#e25734','#e35933',
  '#e45a31','#e55c30','#e65d2f','#e75e2e','#e8602d','#e9612b','#ea632a','#eb6429',
  '#eb6628','#ec6726','#ed6925','#ee6a24','#ef6c23','#ef6e21','#f06f20','#f1711f',
  '#f1731d','#f2741c','#f3761b','#f37819','#f47918','#f57b17','#f57d15','#f67e14',
  '#f68013','#f78212','#f78410','#f8850f','#f8870e','#f8890c','#f98b0b','#f98c0a',
  '#f98e09','#fa9008','#fa9207','#fa9407','#fb9606','#fb9706','#fb9906','#fb9b06',
  '#fb9d07','#fc9f07','#fca108','#fca309','#fca50a','#fca60c','#fca80d','#fcaa0f',
  '#fcac11','#fcae12','#fcb014','#fcb216','#fcb418','#fbb61a','#fbb81d','#fbba1f',
  '#fbbc21','#fbbe23','#fac026','#fac228','#fac42a','#fac62d','#f9c72f','#f9c932',
  '#f9cb35','#f8cd37','#f8cf3a','#f7d13d','#f7d340','#f6d543','#f6d746','#f5d949',
  '#f5db4c','#f4dd4f','#f4df53','#f4e156','#f3e35a','#f3e55d','#f2e661','#f2e865',
  '#f2ea69','#f1ec6d','#f1ed71','#f1ef75','#f1f179','#f2f27d','#f2f482','#f3f586',
  '#f3f68a','#f4f88e','#f5f992','#f6fa96','#f8fb9a','#f9fc9d','#fafda1','#fcffa4',
];

/** Attempt to the Inferno perceptual colormap. t must be in [0, 1]. */
const interpolateInferno = (t: number): string => {
  t = Math.max(0, Math.min(1, t));
  return INFERNO_LUT[Math.round(t * 255)];
};

const calculatePoint = (i, intervalSize, colorRangeInfo) => {
  const { colorStart, colorEnd, useEndAsStart } = colorRangeInfo;
  return useEndAsStart
    ? colorEnd - i * intervalSize
    : colorStart + i * intervalSize;
};

const interpolateColors = (dataLength, colorScale, colorRangeInfo) => {
  const { colorStart, colorEnd } = colorRangeInfo;
  const colorRange = colorEnd - colorStart;
  const intervalSize = colorRange / dataLength;
  let i, colorPoint;
  const colorArray = [];

  for (i = 0; i < dataLength; i++) {
    colorPoint = calculatePoint(i, intervalSize, colorRangeInfo);
    colorArray.push(colorScale(colorPoint));
  }

  return colorArray;
};

export const generateColors = (amount: number, colorRangeInfo): string[] =>
  interpolateColors(amount, interpolateInferno, colorRangeInfo);

export const hexToRgb = (hex) => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (_, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return result ? `${r}, ${g}, ${b}` : null;
};

const hslToHex = (h, s, l) => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1, g1, b1;

  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);

  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

/**
 *
 * @param hex Color hex
 * @param lightness Form 0 (dark) to 1 (light)
 * @param rgb Return as RGB color
 * @returns New color in hex or rgb
 */
const colorLightness = (hex: string, lightness: number, rgb = false) => {
  // HEX to RGB
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  // RGB to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let l = (max + min) / 2; // Lightness
  let h, s;

  if (max === min) {
    h = s = 0; // gray
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h *= 60;
  }

  l = Math.max(0, Math.min(1, lightness));

  const newHex = hslToHex(h, s, l);

  if (rgb) return hexToRgb(newHex);
  return newHex;
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
    let _color;
    if (color === DEFAULT_PRIMARY_COLORS[600]) {
      _color = DEFAULT_PRIMARY_COLORS[key];
    } else {
      _color = Number(key) === 600 ? color : colorLightness(color, luminance);
    }
    const colorRgb = hexToRgb(_color);
    Object.assign(brandColors, { [key]: _color, [key + '-rgb']: colorRgb });
  });

  return brandColors;
};
