import * as classNames from 'classnames';
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
    const {
      input,
      required,
      label,
      description,
      labelClass,
      controlClass,
      meta: {error},
      children,
      ...rest,
    } = this.props;
    return (
      <div className="form-group">
        <label className={classNames('control-label', labelClass)}>
          {label}{required && <span className="text-danger"> *</span>}
        </label>
        <div className={classNames(controlClass)}>
          {React.cloneElement((children as any), {input, ...rest})}
          {description && <p className="help-block m-b-none text-muted">{description}</p>}
          <FieldError error={error}/>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    const { meta, input } = this.props;
    meta.dispatch(clearFields(meta.form, false, false, input.name));
  }
}
