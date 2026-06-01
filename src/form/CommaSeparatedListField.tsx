import { omit } from 'lodash-es';
import { FC } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';

import { translate } from '@/i18n';

import { FormField } from './types';

interface CommaSeparatedListFieldProps
  extends FormField, Omit<FormControlProps, 'onBlur'> {
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
  const valueProp = input ? input.value : (rest as any).value;
  const onChangeProp = input ? input.onChange : (rest as any).onChange;
  const onBlurProp = input ? input.onBlur : (rest as any).onBlur;

  const value = Array.isArray(valueProp)
    ? valueProp.join(sep === 'comma' ? ', ' : ' ')
    : valueProp;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const parsedValue = newValue
      .split(sep === 'comma' ? ',' : ' ')
      .map((item) => item.trim());
    if (onChangeProp) {
      onChangeProp(parsedValue);
    }
  };

  const handleBlur = (e) => {
    const parsedValue = (valueProp || []).filter(
      (item) => !['', undefined, null].includes(item),
    );
    if (onChangeProp) {
      onChangeProp(parsedValue);
    }
    if (onBlurProp) {
      onBlurProp(e);
    }
  };

  const domProps = omit(rest, [
    'value',
    'onChange',
    'onBlur',
    'name',
    'meta',
    'label',
    'description',
    'validate',
    'spaceless',
    'space',
  ]);

  return (
    <Form.Control
      className={solid && 'form-control-solid'}
      type="text"
      placeholder={placeholder}
      {...domProps}
      value={value || ''}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};
