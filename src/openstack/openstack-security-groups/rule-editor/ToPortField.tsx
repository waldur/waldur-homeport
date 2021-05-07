import { FC, useMemo } from 'react';
import { Field } from 'redux-form';

import { maxValue, minValue, required } from '@waldur/core/validators';
import {
  formatIntField,
  parseIntField,
} from '@waldur/marketplace/common/utils';

import { FormField } from './FormField';
import { Rule } from './types';
import { getPortMax } from './utils';

interface ToPortFieldProps {
  rule: Rule;
}

export const ToPortField: FC<ToPortFieldProps> = ({ rule }) => {
  const min = rule.from_port || -1;
  const max = getPortMax(rule);
  const validate = useMemo(
    () => [
      required,
      minValue(min),
      maxValue(max),
      (value) =>
        value !== -1 &&
        min === -1 &&
        '"from_port" should not be -1 if "to_port" is defined.',
    ],
    [min, max],
  );
  return (
    <Field
      name="to_port"
      validate={validate}
      component={FormField}
      type="number"
      parse={parseIntField}
      format={formatIntField}
    />
  );
};
