import * as classNames from 'classnames';
import * as React from 'react';
import { clearFields, WrappedFieldMetaProps } from 'redux-form';

import { Tooltip } from '@waldur/core/Tooltip';
import { omit } from '@waldur/core/utils';

import { FieldError } from './FieldError';
import { FormField } from './types';

export interface FormGroupProps extends FormField {
  meta: WrappedFieldMetaProps;
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
      layout,
      meta: { touched, error },
      children,
      ...rest
    } = this.props;
    const newProps = {
      input,
      ...omit(rest, 'clearOnUnmount'),
      onBlur: event => {
        if (!this.props.noUpdateOnBlur) {
          this.props.input.onBlur(event);
        }
      },
    };
    return (
      <div className="form-group">
        {!hideLabel && (
          <label
            className={
              layout !== 'vertical'
                ? classNames('control-label', labelClass)
                : undefined
            }
          >
            {tooltip && (
              <Tooltip id="form-field-tooltip" label={tooltip}>
                <i className="fa fa-question-circle" />{' '}
              </Tooltip>
            )}
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
        )}
        <div
          className={
            layout !== 'vertical'
              ? classNames(controlClass, { 'col-sm-offset-3': hideLabel })
              : undefined
          }
        >
          {React.cloneElement(children as any, newProps)}
          {description && (
            <p className="help-block m-b-none text-muted">{description}</p>
          )}
          {touched && <FieldError error={error} />}
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    const { meta, input, clearOnUnmount } = this.props;
    if (clearOnUnmount === false) {
      return;
    }
    meta.dispatch(clearFields(meta.form, false, false, input.name));
  }
}
