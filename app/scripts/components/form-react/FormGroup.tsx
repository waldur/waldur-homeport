import * as React from 'react';
// @ts-ignore
import { clearFields, WrappedFieldMetaProps } from 'redux-form';

import { FieldError } from './FieldError';
import { FormField } from './types';

interface FormGroupProps extends FormField {
  meta: WrappedFieldMetaProps;
  children: React.ReactChildren;
}

export class FormGroup extends React.PureComponent<FormGroupProps> {
  render() {
    const { input, required, label, meta: {error}, children, ...rest } = this.props;
    return (
      <div className="form-group">
        <label className="control-label">
          {label}{required && <span className="text-danger"> *</span>}
        </label>
        {React.cloneElement((children as any), {input, ...rest})}
        <FieldError error={error}/>
      </div>
    );
  }

  componentWillUnmount() {
    const { meta, input } = this.props;
    meta.dispatch(clearFields(meta.form, false, false, input.name));
  }
}
