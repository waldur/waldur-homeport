import * as classNames from 'classnames';
import * as React from 'react';
// @ts-ignore
import { clearFields, WrappedFieldMetaProps } from 'redux-form';

import { Tooltip } from '@waldur/core/Tooltip';
import { omit } from '@waldur/core/utils';

import { FieldError } from './FieldError';
import { FormField } from './types';

interface FormGroupProps extends FormField {
  meta: WrappedFieldMetaProps;
  children: React.ReactChildren;
  clearOnUnmount?: boolean;
}

export class FormGroup extends React.PureComponent<FormGroupProps> {
  render() {
    const {
      input,
      required,
      label,
      description,
      tooltip,
      labelClass,
      hideLabel,
      controlClass,
      meta: { touched, error },
      children,
      ...rest,
    } = this.props;
    return (
      <div className="form-group">
        {!hideLabel && (
          <label className={classNames('control-label', labelClass)}>
            {tooltip && (
              <Tooltip id="form-field-tooltip" label={tooltip}>
                <i className="fa fa-question-circle"/>{' '}
              </Tooltip>
            )}
            {label}{required && <span className="text-danger"> *</span>}
          </label>
        )}
        <div className={classNames(controlClass, {'col-sm-offset-3': hideLabel})}>
          {React.cloneElement((children as any), { input, ...omit(rest, 'clearOnUnmount') })}
          {description && <p className="help-block m-b-none text-muted">{description}</p>}
          {touched && <FieldError error={error} />}
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    const { meta, input, clearOnUnmount } = this.props;
    if (clearOnUnmount === false) { return; }
    meta.dispatch(clearFields(meta.form, false, false, input.name));
  }
}
