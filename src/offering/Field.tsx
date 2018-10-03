import * as React from 'react';

interface FieldProps {
  label: React.ReactNode;
  children: React.ReactNode;
}

export const Field = (props: FieldProps) => (
  <div className="m-b-xs">
    <dt>{props.label}:</dt>
    <dd>{props.children}</dd>
  </div>
);
