import classNames from 'classnames';
import { FC } from 'react';

interface ImageProps {
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
  classes = '',
  circle,
}) => {
  return (
    <div
      className={classNames(
        `symbol symbol-${size}px`,
        classes,
        isContain && 'symbol-contain',
        circle && 'symbol-circle',
      )}
    >
      <div
        className="symbol-label"
        style={{ backgroundImage: `url(${src})` }}
      />
    </div>
  );
};
