import { FC, useMemo } from 'react';
import { Field } from 'react-final-form';

import { composeValidators } from '@/core/validators';
import { FormGroupFinal, NumberField } from '@/form';
import { translate } from '@/i18n';

import { validatePercent } from './constants';

export const GraceCoefficientField: FC = () => {
  const validate = useMemo(() => composeValidators(validatePercent), []);

  return (
    <Field
      name="grace_coefficient"
      label={translate('Grace coefficient')}
      validate={validate}
      component={FormGroupFinal}
    >
      <NumberField placeholder="0" unit="%" />
    </Field>
  );
};
