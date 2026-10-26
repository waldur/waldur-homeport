import { CubeIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Avatar } from 'waldur-ui';

interface CategoryThumbnailProps {
  title: string;
  icon?: string;
  size?: number;
  fallbackSize?: number;
  circle?: boolean;
  shape?: 'circle' | 'square';
  fallbackClassName?: string;
}

export const CategoryThumbnail: FC<CategoryThumbnailProps> = ({
  title,
  icon,
  size = 18,
  fallbackSize,
  circle = false,
  shape,
  fallbackClassName = 'text-quaternary',
}) =>
  icon ? (
    <Avatar
      data-testid="category-thumbnail"
      name={title}
      src={icon}
      shape={shape ?? (circle ? 'circle' : 'square')}
      size={size}
    />
  ) : (
    <CubeIcon
      size={fallbackSize ?? size}
      weight="bold"
      className={fallbackClassName || undefined}
    />
  );
