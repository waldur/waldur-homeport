import { XIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import React from 'react';

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
    className={classNames(
      'text-btn text-quinary hover:text-quaternary leading-none',
      className,
    )}
    onClick={onClick}
  >
    <XIcon weight="bold" size={size} />
  </button>
);
