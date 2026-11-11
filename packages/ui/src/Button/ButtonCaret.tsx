import { CaretDownIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { cn } from '../cn';

import { ButtonSize } from './BaseButton';
import { getButtonIconSize } from './buttonIconSizes';

export interface ButtonCaretProps {
  /** Size variant matching the parent button's size ('sm' | 'md' | 'lg') */
  size?: ButtonSize;
  /**
   * Explicit open state for a toggle that isn't a Radix trigger. Without
   * it, the caret flips while the nearest `group/toggle` ancestor is
   * `data-state="open"` (a Radix trigger).
   */
  isOpen?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Standard caret dropdown indicator icon for buttons and dropdown toggles.
 *
 * Uses Phosphor's CaretDownIcon with weight="bold" and standard button icon
 * sizing (16px for 'sm', 20px for 'md'/'lg'). A menu toggle marks itself
 * `group/toggle`, and the caret flips while that toggle is open: Radix sets
 * data-state="open" on its trigger. A toggle that isn't one passes `isOpen`.
 */
export const ButtonCaret: FC<ButtonCaretProps> = ({
  size,
  isOpen,
  className,
}) => (
  <CaretDownIcon
    weight="bold"
    size={getButtonIconSize(size)}
    className={cn(
      'shrink-0 transition-[rotate] duration-300 ease-[ease] group-data-[state=open]/toggle:rotate-180',
      isOpen && 'rotate-180',
      className,
    )}
  />
);
