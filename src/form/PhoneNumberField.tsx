import { PhoneIcon } from '@phosphor-icons/react';
import { omit } from 'lodash-es';
import { FC, useCallback } from 'react';
import { Form, FormControlProps, InputGroup } from 'react-bootstrap';

import { formatPhoneNumber } from '@waldur/core/utils';

import { FormField } from './types';

interface PhoneNumberFieldProps
  extends FormField, Omit<FormControlProps, 'onBlur'> {
  placeholder?: string;
  solid?: boolean;
}

const FORM_FIELD_PROPS = [
  'validate',
  'normalize',
  'format',
  'parse',
  'meta',
  'noUpdateOnBlur',
  'containerClassName',
  'spaceless',
  'space',
  'hideLabel',
] as const;

export const PhoneNumberField: FC<PhoneNumberFieldProps> = ({
  input,
  solid = false,
  placeholder = ' ',
  ...rest
}) => {
  const props = omit(rest, FORM_FIELD_PROPS);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      if (formatted && formatted !== e.target.value) {
        input.onChange(formatted);
      }
      input.onBlur(e);
    },
    [input],
  );

  return (
    <InputGroup className="has-icon">
      <div className="input-group-icon">
        <PhoneIcon weight="bold" />
      </div>
      <Form.Control
        {...input}
        {...props}
        type="tel"
        className={solid ? 'form-control-solid' : undefined}
        placeholder={placeholder}
        onBlur={handleBlur}
      />
    </InputGroup>
  );
};
