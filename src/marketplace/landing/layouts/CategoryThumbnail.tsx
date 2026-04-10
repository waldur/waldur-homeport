import { CubeIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import Avatar from '@waldur/core/Avatar';

interface CategoryThumbnailProps {
  title: string;
  icon?: string;
  size?: number;
  fallbackSize?: number;
  circle?: boolean;
  fallbackClassName?: string;
}

export const CategoryThumbnail: FC<CategoryThumbnailProps> = ({
  title,
  icon,
  size = 18,
  fallbackSize,
  circle,
  fallbackClassName = 'text-muted',
}) =>
  icon ? (
    <Avatar name={title} src={icon} circle={circle} size={size} />
  ) : (
    <CubeIcon
      size={fallbackSize ?? size}
      weight="bold"
      className={fallbackClassName || undefined}
    />
  );
