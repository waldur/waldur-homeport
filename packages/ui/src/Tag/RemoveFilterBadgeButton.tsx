import { XIcon } from '@phosphor-icons/react';
import React from 'react';

import { cn } from '../cn';

interface RemoveFilterBadgeButtonProps {
  onClick(event: React.MouseEvent<HTMLButtonElement>): void;
  size?: number;
  className?: string;
  /** Accessible name — the button shows only an icon. */
  label?: string;
}

export const RemoveFilterBadgeButton: React.FC<
  RemoveFilterBadgeButtonProps
> = ({ onClick, size = 12, className = '', label }) => (
  <button
    type="button"
    aria-label={label}
    className={cn(
      'text-btn text-quinary hover:text-quaternary leading-none',
      className,
    )}
    onClick={onClick}
  >
    <XIcon weight="bold" size={size} />
  </button>
);
