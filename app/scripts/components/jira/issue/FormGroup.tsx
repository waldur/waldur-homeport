import * as React from 'react';

interface Props {
  label: string;
  children: React.ReactNode;
}

export const FormGroup = (props: Props) => (
  <div className="form-group">
    <label className="control-label">
      {props.label}:
    </label>
    {props.children}
  </div>
);
