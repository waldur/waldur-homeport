import { IconProps, SpinnerIcon } from '@phosphor-icons/react';

import { cn } from '../cn';

/**
 * Tailwind-native loading spinner. Tailwind ships animate-spin
 * built in, and SpinnerIcon already renders with fill="currentColor", so
 * no color class is needed at all — it inherits the ambient text color.
 */
export const LoadingSpinner = ({ className, ...rest }: IconProps) => (
  <SpinnerIcon
    className={cn('animate-spin', className)}
    role="status"
    weight="bold"
    {...rest}
  />
);
