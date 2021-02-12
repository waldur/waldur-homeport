import { FC, useMemo } from 'react';
import { Field } from 'redux-form';

import { maxValue, minValue, required } from '@waldur/core/validators';

import { FormField } from './FormField';
import { Rule } from './types';
import { getPortMax } from './utils';

interface Props {
  rule: Rule;
}

export const ToPortField: FC<Props> = ({ rule }) => {
  const min = rule.from_port || -1;
  const max = getPortMax(rule);
  const validate = useMemo(() => [required, minValue(min), maxValue(max)], [
    min,
    max,
  ]);
  return (
    <Field
      name="to_port"
      validate={validate}
      component={FormField}
      type="number"
    />
  );
};
