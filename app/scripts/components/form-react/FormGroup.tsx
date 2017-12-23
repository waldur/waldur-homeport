import * as React from 'react';
import { WrappedFieldMetaProps } from 'redux-form';

import { FieldError } from './FieldError';
import { FormField } from './types';

interface FormGroupProps extends FormField {
  meta: WrappedFieldMetaProps;
  children: React.ReactChildren;
}

export const FormGroup = (props: FormGroupProps) => {
  const { input, required, label, meta: {error}, children, ...rest } = props;
  return (
    <div className="form-group">
      <label className="control-label">
        {label}{required && <span className="text-danger"> *</span>}
      </label>
      {React.cloneElement((children as any), {input, ...rest})}
      <FieldError error={error}/>
    </div>
  );
};
