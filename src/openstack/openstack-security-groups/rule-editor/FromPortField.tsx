import { FC, useMemo } from 'react';
import { Field } from 'redux-form';

import { maxValue, minValue, required } from '@waldur/core/validators';

import { FormField } from './FormField';
import { Rule } from './types';
import { getPortMax, getPortMin } from './utils';

interface Props {
  rule: Rule;
}

export const FromPortField: FC<Props> = ({ rule }) => {
  const min = getPortMin(rule);
  const max = getPortMax(rule);
  const validate = useMemo(() => [required, minValue(min), maxValue(max)], [
    min,
    max,
  ]);
  return (
    <Field
      name="from_port"
      validate={validate}
      component={FormField}
      type="number"
    />
  );
};
