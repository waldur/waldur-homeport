import * as React from 'react';

interface FieldProps {
  label: React.ReactNode;
}

export const Field: React.FC<FieldProps> = props => (
  <div className="m-b-xs">
    <dt>{props.label}:</dt>
    <dd>{props.children}</dd>
  </div>
);
