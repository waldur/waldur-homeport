import { FC } from 'react';
import './ImagePlaceholder.css';

interface ImagePlaceholderProps {
  width?: string;
  height?: string;
  backgroundColor?: string;
}

export const ImagePlaceholder: FC<ImagePlaceholderProps> = (props) => {
  return (
    <div
      className="image-placeholder"
      style={{
        width: props.width,
        minWidth: props.width,
        height: props.height,
        backgroundColor: props.backgroundColor,
      }}
    >
      {props.children}
    </div>
  );
};

ImagePlaceholder.defaultProps = {
  width: '24px',
  height: '24px',
  backgroundColor: '#eee',
};
