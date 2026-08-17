import { IconProps, SpinnerIcon } from '@phosphor-icons/react';

import { cn } from './cn';

/**
 * Tailwind-native counterpart to src/core/LoadingSpinner.tsx's
 * LoadingSpinnerSimple — that one depends on Metronic's .animation-spin
 * class and Bootstrap's .text-primary utility. Tailwind ships animate-spin
 * built in, and SpinnerIcon already renders with fill="currentColor", so
 * no color class is needed at all — it inherits the ambient text color the
 * same way the old default effectively did, without a Bootstrap class to
 * do it.
 */
export const LoadingSpinner = ({ className, ...rest }: IconProps) => (
  <SpinnerIcon
    className={cn('animate-spin', className)}
    role="status"
    weight="bold"
    {...rest}
  />
);
