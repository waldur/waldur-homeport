import { FC } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { FormField } from './types';

interface CommaSeparatedListFieldProps
  extends FormField,
    Omit<FormControlProps, 'onBlur'> {
  placeholder?: string;
  style?: any;
  maxLength?: number;
  autoFocus?: boolean;
  solid?: boolean;
}

export const CommaSeparatedListField: FC<CommaSeparatedListFieldProps> = ({
  input,
  placeholder = translate('Enter comma-separated values'),
  solid,
  ...rest
}) => {
  const value = Array.isArray(input.value)
    ? input.value.join(', ')
    : input.value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const parsedValue = newValue.split(',').map((item) => item.trim());
    input.onChange(parsedValue);
  };

  return (
    <Form.Control
      className={solid && 'form-control-solid'}
      type="text"
      placeholder={placeholder}
      value={value || ''}
      onChange={handleChange}
      {...rest}
    />
  );
};
