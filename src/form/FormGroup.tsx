import classNames from 'classnames';
import { cloneElement, PureComponent } from 'react';
import { Form, Row } from 'react-bootstrap';
import { clearFields, WrappedFieldMetaProps } from 'redux-form';

import { Tip } from '@waldur/core/Tooltip';
import { omit } from '@waldur/core/utils';

import { FormFieldsContext } from './context';
import { FieldError } from './FieldError';
import { FormField } from './types';

export interface FormGroupProps extends FormField {
  meta: WrappedFieldMetaProps;
  clearOnUnmount?: boolean;
}

export class FormGroup extends PureComponent<FormGroupProps> {
  static contextType = FormFieldsContext;

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
      readOnly: this.context.readOnlyFields.includes(input.name),
      onBlur: (event) => {
        if (!this.props.noUpdateOnBlur) {
          this.props.input.onBlur(event);
        }
      },
    };
    return (
      <Form.Group as={Row} className="mb-8">
        {!hideLabel && (
          <Form.Label
            className={classNames(
              { required },
              layout !== 'vertical' && labelClass,
              'fs-6 fw-bold mb-2',
            )}
          >
            {tooltip && (
              <Tip id="form-field-tooltip" label={tooltip}>
                <i className="fa fa-question-circle" />{' '}
              </Tip>
            )}
            {label}
          </Form.Label>
        )}
        <div
          className={
            layout !== 'vertical'
              ? classNames(controlClass, { 'col-sm-offset-3': hideLabel })
              : undefined
          }
        >
          {cloneElement(children as any, newProps)}
          {description && (
            <Form.Text muted={true} className="m-b-none">
              {description}
            </Form.Text>
          )}
          {touched && <FieldError error={error} />}
        </div>
      </Form.Group>
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
