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
  separator?: 'comma' | 'space';
}

export const CommaSeparatedListField: FC<CommaSeparatedListFieldProps> = ({
  input,
  placeholder = translate('Enter comma-separated values'),
  solid,
  separator: sep = 'comma',
  ...rest
}) => {
  const value = Array.isArray(input.value)
    ? input.value.join(sep === 'comma' ? ', ' : ' ')
    : input.value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const parsedValue = newValue
      .split(sep === 'comma' ? ',' : ' ')
      .map((item) => item.trim());
    input.onChange(parsedValue);
  };
  const handleBlur = () => {
    const parsedValue = (input.value || []).filter(
      (item) => !['', undefined, null].includes(item),
    );
    input.onChange(parsedValue);
  };

  return (
    <Form.Control
      className={solid && 'form-control-solid'}
      type="text"
      placeholder={placeholder}
      value={value || ''}
      onChange={handleChange}
      onBlur={handleBlur}
      {...rest}
    />
  );
};
