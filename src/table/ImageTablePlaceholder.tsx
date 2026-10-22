import React from 'react';

interface ImageTablePlaceholderProps {
  illustration: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export const ImageTablePlaceholder: React.FC<ImageTablePlaceholderProps> = (
  props,
) => (
  <div style={{ clear: 'both' }} className="justify-center row">
    <div className="col-sm-4">
      <div style={{ width: '100%' }}>{props.illustration}</div>
      <div className="text-center">
        <h2>{props.title}</h2>
        {props.description && <p>{props.description}</p>}
        {props.action}
      </div>
    </div>
  </div>
);
