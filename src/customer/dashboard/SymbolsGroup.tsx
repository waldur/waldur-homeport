import classNames from 'classnames';
import { FC } from 'react';
import { User } from 'waldur-js-client';

import { Avatar, AvatarGroup, Tooltip } from 'waldur-ui';

export interface SymbolsGroupProps {
  items: object[];
  max?: number;
  nameKey?: string;
  emailKey?: string;
  imageKey?: string;
  length?: number;
  size?: number;
  space?: 'sm' | 'xs';
  onClick?(): void;
}

export const SymbolsGroup: FC<SymbolsGroupProps> = ({
  max = 8,
  nameKey = 'full_name',
  emailKey = 'email',
  imageKey = 'image',
  items,
  length,
  size = 35,
  space,
  onClick,
}) => {
  const spacing = space === 'sm' ? 'sm' : space === 'xs' ? 'xs' : 'lg';

  return (
    <div
      className={classNames(
        'inline-flex items-center',
        onClick && 'cursor-pointer',
      )}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <AvatarGroup spacing={spacing} size={size} max={max} totalCount={length}>
        {items.map((item: User, index: number) => (
          <Tooltip key={index} label={item[nameKey]}>
            <Avatar
              size={size}
              src={item[imageKey]}
              name={item[nameKey] || item[emailKey] || '?'}
            />
          </Tooltip>
        ))}
      </AvatarGroup>
    </div>
  );
};
