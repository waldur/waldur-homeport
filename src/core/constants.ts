export const RATING_STAR_ACTIVE_COLOR = '#f79009'; // warning-500
export const RATING_STAR_INACTIVE_COLOR = '#98a2b3'; // gray-400

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

export const GRID_BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    '.docx',
  ],
  'application/msword': ['.doc'],
  'application/vnd.oasis.opendocument.text': ['.odt'],
};

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
export const SECOND = 1000;

export const FAST_STALE_TIME = 30 * 1000;
export const SHORT_STALE_TIME = 1 * MINUTE;
export const UI_STALE_TIME = 3 * MINUTE;
export const STALE_TIME = 5 * MINUTE;
export const LONG_STALE_TIME = 10 * MINUTE;
