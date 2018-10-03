import * as React from 'react';

interface FormGroupProps {
  label?: string;
  children: React.ReactNode;
  required?: boolean;
}

export const FormGroup = (props: FormGroupProps) => (
  <div className="form-group">
    {props.label ? (
      <>
        <label className="control-label col-sm-4">
          {props.label}
          {props.required && <span className="text-danger"> *</span>}
        </label>
        <div className="col-sm-8">
          {props.children}
        </div>
      </>
    ) : (
      <div className="col-sm-offset-4 col-sm-8">
        {props.children}
      </div>
    )}
  </div>
);
