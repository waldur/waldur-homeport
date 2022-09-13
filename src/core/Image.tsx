import React from 'react';

interface ImageProps {
  src: string;
  size: number | string;
  classes?: string;
}

export const Image: React.FC<ImageProps> = ({ src, size, classes }) => {
  return (
    <div className={`symbol symbol-${size}px ${classes}`}>
      <div
        className="symbol-label"
        style={{ backgroundImage: `url(${src})` }}
      ></div>
    </div>
  );
};

Image.defaultProps = {
  classes: '',
};
