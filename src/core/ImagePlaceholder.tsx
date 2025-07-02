import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';
import './ImagePlaceholder.css';

export const getPlaceholderFontSize = (size: string | number) => {
  const s = typeof size === 'string' ? Number(size.split('px')[0]) : size;
  if (!s) return 18;
  else if (s <= 24) return 12;
  else if (s <= 32) return 14;
  else if (s <= 40) return 16;
  else if (s <= 48) return 18;
  else if (s <= 56) return 20;
  else return 24;
};

interface ImagePlaceholderProps {
  width?: string;
  height?: string;
  backgroundColor?: string;
  circle?: boolean;
  minWidth?;
  className?: string;
}

export const ImagePlaceholder: FC<PropsWithChildren<ImagePlaceholderProps>> = ({
  width = '24px',
  height = '24px',
  backgroundColor,
  circle,
  minWidth,
  className,
  children,
}) => {
  return (
    <div
      className={classNames('image-placeholder', circle && 'circle', className)}
      style={{
        width,
        minWidth,
        height,
        backgroundColor,
        fontSize: getPlaceholderFontSize(width) + 'px',
      }}
    >
      {children}
    </div>
  );
};
