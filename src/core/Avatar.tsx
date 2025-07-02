import classNames from 'classnames';
import { FC } from 'react';

import { Image } from './Image';
import { getPlaceholderFontSize } from './ImagePlaceholder';

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  className?: string;
  labelClassName?: string;
  circle?: boolean;
}
const Avatar: FC<AvatarProps> = ({
  size = 32,
  name,
  src,
  className,
  labelClassName,
  circle,
}) => {
  const acronym = name
    ? name
        ?.split(' ')
        .map((item) => item.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : name;

  if (src) {
    return <Image src={src} size={size} isContain circle={circle} />;
  }

  return (
    <div
      className={classNames(
        `symbol symbol-${size}px`,
        circle && 'symbol-circle',
        className,
      )}
      style={{ fontSize: getPlaceholderFontSize(size) + 'px' }}
    >
      <div className={classNames('symbol-label', labelClassName)}>
        {acronym}
      </div>
    </div>
  );
};

export default Avatar;
