import classNames from 'classnames';
import { forwardRef, PropsWithChildren } from 'react';

import { RemoveFilterBadgeButton } from './RemoveFilterBadgeButton';

interface TagProps {
  onClear?(e): void;
  onClick?(e): void;
  size?: 'sm' | 'lg';
  className?: string;
}

export const Tag = forwardRef<HTMLSpanElement, PropsWithChildren<TagProps>>(
  ({ children, onClear, onClick, size, className }, ref) => (
    <span
      ref={ref}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={classNames('tag', size && `tag-${size}`, className)}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
    >
      {children}
      {!!onClear && (
        <RemoveFilterBadgeButton
          size={size === 'sm' ? 10 : 12}
          onClick={onClear}
        />
      )}
    </span>
  ),
);
