import { FC } from 'react';

import { Avatar } from 'waldur-ui';

export interface ImageProps {
  src: string;
  size: number | string;
  isContain?: boolean;
  classes?: string;
  circle?: boolean;
}

export const Image: FC<ImageProps> = ({
  src,
  size,
  isContain,
  classes,
  circle,
}) => (
  <Avatar
    src={src}
    size={size}
    shape={circle ? 'circle' : 'square'}
    isContain={isContain}
    className={classes}
    fallbackClassName="bg-transparent"
  />
);
