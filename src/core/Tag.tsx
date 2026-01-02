import classNames from 'classnames';
import { forwardRef, PropsWithChildren } from 'react';

import { RemoveFilterBadgeButton } from '@waldur/table/TableFilterItem';

interface TagProps {
  onClear?(e): void;
  size?: 'sm' | 'lg';
  className?: string;
}

export const Tag = forwardRef<HTMLSpanElement, PropsWithChildren<TagProps>>(
  ({ children, onClear, size, className }, ref) => (
    <span
      ref={ref}
      className={classNames('tag', size && `tag-${size}`, className)}
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
