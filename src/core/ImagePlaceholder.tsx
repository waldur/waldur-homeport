import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';
import './ImagePlaceholder.css';

interface ImagePlaceholderProps {
  width?: string;
  height?: string;
  backgroundColor?: string;
  minWidth?;
  className?: string;
}

export const ImagePlaceholder: FC<PropsWithChildren<ImagePlaceholderProps>> = ({
  width = '24px',
  height = '24px',
  backgroundColor = '#eee',
  minWidth,
  className,
  children,
}) => {
  return (
    <div
      className={classNames('image-placeholder', className)}
      style={{
        width,
        minWidth,
        height,
        backgroundColor,
      }}
    >
      {children}
    </div>
  );
};
