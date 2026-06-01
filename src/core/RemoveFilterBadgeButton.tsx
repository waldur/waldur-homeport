import { XIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import React from 'react';

interface RemoveFilterBadgeButtonProps {
  onClick(event: React.MouseEvent<HTMLButtonElement>): void;
  size?: number;
  className?: string;
}

export const RemoveFilterBadgeButton: React.FC<
  RemoveFilterBadgeButtonProps
> = ({ onClick, size = 12, className = '' }) => (
  <button
    type="button"
    className={classNames(
      'text-btn text-gray-400 text-hover-gray-500 lh-0',
      className,
    )}
    onClick={onClick}
  >
    <XIcon weight="bold" size={size} />
  </button>
);
