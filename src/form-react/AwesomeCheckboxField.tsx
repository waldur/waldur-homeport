import * as React from 'react';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';

import { FormField } from './types';

interface AwesomeCheckboxFieldProps extends FormField {
  className?: string;
  checked?: boolean;
}

export const AwesomeCheckboxField = (props: AwesomeCheckboxFieldProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, validate, ...rest } = props;
  return (
    <AwesomeCheckbox label={label} id="checkbox-field" {...input} {...rest} />
  );
};
