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
  <div className="flex flex-wrap justify-center" style={{ clear: 'both' }}>
    <div className="w-full sm:w-4/12">
      <div style={{ width: '100%' }}>{props.illustration}</div>
      <div className="text-center">
        <h2>{props.title}</h2>
        {props.description && <p>{props.description}</p>}
        {props.action}
      </div>
    </div>
  </div>
);
