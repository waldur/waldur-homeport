import { CaretDownIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { ButtonSize } from './BaseButton';
import { getButtonIconSize } from './buttonIconSizes';
import { cn } from './cn';

export interface ButtonCaretProps {
  /** Size variant matching the parent button's size ('sm' | 'md' | 'lg') */
  size?: ButtonSize;
  /**
   * Explicit open state for controlled dropdowns or non-Radix toggles.
   * If true, applies inline transform rotation (180deg).
   * If omitted or undefined, relies on CSS animation via
   * `.dropdown-toggle[data-state='open'] > .rotate-toggle-180` or `.show > .rotate-toggle-180`.
   */
  isOpen?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Standard caret dropdown indicator icon for buttons and dropdown toggles.
 *
 * Uses Phosphor's CaretDownIcon with weight="bold" and standard button icon sizing
 * (16px for 'sm', 20px for 'md'/'lg'). Includes `.rotate-toggle-180` for smooth
 * bidirectional rotation transitions matching Metronic's CSS rules.
 */
export const ButtonCaret: FC<ButtonCaretProps> = ({
  size,
  isOpen,
  className,
}) => (
  <CaretDownIcon
    weight="bold"
    size={getButtonIconSize(size)}
    style={isOpen ? { transform: 'rotateZ(180deg)' } : undefined}
    className={cn('flex-shrink-0 rotate-toggle-180', className)}
  />
);
