import { ButtonSize } from './BaseButton';

/**
 * Standard button icon sizes in pixels.
 *
 * Snapped to integer pixels (matching Tailwind's standard `size-4` and `size-5` steps):
 * - sm: 16px (`size-4`)
 * - md / lg: 20px (`size-5`)
 */
export const BUTTON_ICON_SIZES = {
  sm: 16,
  md: 20,
  lg: 20,
} as const;

/**
 * Returns the numeric icon size in pixels for a given button size variant.
 */
export const getButtonIconSize = (size?: ButtonSize): number =>
  size === 'sm' ? BUTTON_ICON_SIZES.sm : BUTTON_ICON_SIZES.lg;

/**
 * Returns the icon size as a CSS length string with px units (e.g. '16px', '20px').
 */
export const getButtonIconPx = (size?: ButtonSize): string =>
  `${getButtonIconSize(size)}px`;
