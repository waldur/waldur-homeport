import * as React from 'react';

interface FormGroupProps {
  label?: string;
  children: React.ReactNode;
}

export const FormGroup = (props: FormGroupProps) => (
  <div className="form-group">
    {props.label ? (
      <>
        <label className="control-label col-sm-3">
          {props.label}
        </label>
        <div className="col-sm-9">
          {props.children}
        </div>
      </>
    ) : (
      <div className="col-sm-offset-3 col-sm-9">
        {props.children}
      </div>
    )}
  </div>
);
