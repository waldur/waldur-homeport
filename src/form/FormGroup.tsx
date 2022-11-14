import classNames from 'classnames';
import { cloneElement, PureComponent } from 'react';
import { Form } from 'react-bootstrap';
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

  static defaultProps = {
    floating: false,
  };

  render() {
    const {
      input,
      required,
      label,
      description,
      tooltip,
      hideLabel,
      meta: { touched, error },
      children,
      floating,
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
    const labelNode = !hideLabel && (
      <Form.Label className={classNames({ required })}>
        {tooltip && (
          <Tip id="form-field-tooltip" label={tooltip}>
            <i className="fa fa-question-circle" />{' '}
          </Tip>
        )}
        {label}
      </Form.Label>
    );
    return (
      <div className={classNames({ 'form-floating': floating }, 'mb-7')}>
        {!floating && labelNode}
        {cloneElement(children as any, newProps)}
        {floating && labelNode}
        {description && (
          <Form.Text muted={true} className="mb-0">
            {description}
          </Form.Text>
        )}
        {touched && <FieldError error={error} />}
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
