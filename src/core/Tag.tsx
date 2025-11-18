import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';

import { RemoveFilterBadgeButton } from '@waldur/table/TableFilterItem';

interface TagProps {
  onClear?(e): void;
  size?: 'sm' | 'lg';
  className?: string;
}

export const Tag: FC<PropsWithChildren<TagProps>> = ({
  children,
  onClear,
  size,
  className,
}) => (
  <span className={classNames('tag', size && `tag-${size}`, className)}>
    {children}
    {!!onClear && (
      <RemoveFilterBadgeButton
        size={size === 'sm' ? 10 : 12}
        onClick={onClear}
      />
    )}
  </span>
);
