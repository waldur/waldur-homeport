import { FunctionComponent } from 'react';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';

import { FormField } from './types';

interface AwesomeCheckboxFieldProps extends FormField {
  className?: string;
  checked?: boolean;
}

export const AwesomeCheckboxField: FunctionComponent<AwesomeCheckboxFieldProps> = (
  props,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, validate, ...rest } = props;
  return <AwesomeCheckbox label={label} {...input} {...rest} />;
};
