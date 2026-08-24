import { FC, useState } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import { FieldRenderProps } from 'react-final-form';

import { translate } from '@/i18n';

// ── Base (Pure UI) ──────────────────────────────────────

interface BaseCommaSeparatedListFieldProps extends Omit<
  FormControlProps,
  'value' | 'onChange' | 'onBlur'
> {
  /** The current array value */
  value?: string[];
  /** Called with the parsed array on every keystroke */
  onChange?: (value: string[]) => void;
  /** Called on blur after filtering empty entries */
  onBlur?: (e: React.FocusEvent) => void;
  placeholder?: string;
  solid?: boolean;
  separator?: 'comma' | 'space';
}

const BaseCommaSeparatedListField: FC<BaseCommaSeparatedListFieldProps> = ({
  value: valueProp,
  onChange: onChangeProp,
  onBlur: onBlurProp,
  placeholder = translate('Enter comma-separated values'),
  solid,
  separator: sep = 'comma',
  ...rest
}) => {
  // The text being typed is held locally so that a separator the user has
  // entered but not yet filled in ("a, ") stays on screen, while the value
  // handed to the form stays free of the empty entries that produces. Filtering
  // them on blur instead is not enough: a form can be submitted straight from
  // the keyboard, and an empty entry reaching a list-of-emails API is a 400.
  const [draft, setDraft] = useState<string | null>(null);

  const separator = sep === 'comma' ? ',' : ' ';
  const joiner = sep === 'comma' ? ', ' : ' ';

  const displayValue =
    draft ?? (Array.isArray(valueProp) ? valueProp.join(joiner) : valueProp);

  const parse = (text: string) =>
    text
      .split(separator)
      .map((item) => item.trim())
      .filter(Boolean);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    onChangeProp?.(parse(e.target.value));
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Drop the draft so the input re-renders from the cleaned value.
    setDraft(null);
    onBlurProp?.(e);
  };

  return (
    <Form.Control
      className={solid && 'form-control-solid'}
      type="text"
      placeholder={placeholder}
      {...rest}
      value={displayValue || ''}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

// ── Field Adapter ───────────────────────────────────────

export interface CommaSeparatedListFieldProps extends Omit<
  BaseCommaSeparatedListFieldProps,
  'value' | 'onChange' | 'onBlur' | 'name'
> {
  input: FieldRenderProps<any>['input'];
  meta: FieldRenderProps<any>['meta'];
}

export const CommaSeparatedListField: FC<CommaSeparatedListFieldProps> = ({
  input,
  meta,
  ...rest
}) => (
  <BaseCommaSeparatedListField
    isInvalid={meta.touched && meta.error}
    {...rest}
    {...input}
  />
);
