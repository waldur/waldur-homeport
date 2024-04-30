import { FC } from 'react';

interface ImageProps {
  src: string;
  size: number | string;
  isContain?: boolean;
  classes?: string;
}

export const Image: FC<ImageProps> = ({
  src,
  size,
  isContain,
  classes = '',
}) => {
  return (
    <div
      className={
        `symbol symbol-${size}px ${classes}` +
        (isContain ? 'symbol-contain' : '')
      }
    >
      <div
        className="symbol-label"
        style={{ backgroundImage: `url(${src})` }}
      ></div>
    </div>
  );
};
