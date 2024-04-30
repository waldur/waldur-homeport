import { FC, PropsWithChildren } from 'react';
import './ImagePlaceholder.css';

interface ImagePlaceholderProps {
  width?: string;
  height?: string;
  backgroundColor?: string;
  minWidth?;
}

export const ImagePlaceholder: FC<PropsWithChildren<ImagePlaceholderProps>> = ({
  width = '24px',
  height = '24px',
  backgroundColor = '#eee',
  minWidth,
  children,
}) => {
  return (
    <div
      className="image-placeholder"
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
