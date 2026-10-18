import classNames from 'classnames';
import { forwardRef, PropsWithChildren } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { RemoveFilterBadgeButton } from './RemoveFilterBadgeButton';

interface TagProps {
  onClear?(e): void;
  /**
   * Accessible name of the remove button, e.g. "Remove Finland". Defaults to
   * "Remove {value}" when the tag's content is plain text, else "Remove".
   */
  clearLabel?: string;
  onClick?(e): void;
  size?: 'sm' | 'lg';
  className?: string;
}

export const Tag = forwardRef<HTMLSpanElement, PropsWithChildren<TagProps>>(
  ({ children, onClear, clearLabel, onClick, size, className }, ref) => (
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
          label={
            clearLabel ??
            (typeof children === 'string' || typeof children === 'number'
              ? translate('Remove {value}', { value: children })
              : translate('Remove'))
          }
        />
      )}
    </span>
  ),
);
