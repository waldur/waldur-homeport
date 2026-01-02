import { CalendarIcon } from '@phosphor-icons/react';
import { omit } from 'lodash-es';
import { FC } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

import { FormField } from './types';

interface YearFieldProps extends FormField {
  placeholder?: string;
  solid?: boolean;
  minYear?: number;
  maxYear?: number;
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

const currentYear = new Date().getFullYear();

export const YearField: FC<YearFieldProps> = ({
  input,
  solid = false,
  placeholder,
  minYear = 1900,
  maxYear = currentYear + 10,
  ...rest
}) => {
  const props = omit(rest, FORM_FIELD_PROPS);

  return (
    <InputGroup className="has-icon">
      <div className="input-group-icon">
        <CalendarIcon weight="bold" />
      </div>
      <Form.Control
        {...input}
        {...props}
        type="number"
        min={minYear}
        max={maxYear}
        step={1}
        className={solid ? 'form-control-solid' : undefined}
        placeholder={placeholder || `${minYear}–${maxYear}`}
        onKeyDown={(e) => {
          // Prevent decimal point and 'e' for scientific notation
          if (e.key === '.' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
          }
        }}
      />
    </InputGroup>
  );
};
