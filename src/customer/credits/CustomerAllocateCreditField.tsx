import { FC, useMemo } from 'react';
import { Field } from 'react-final-form';

import { ENV } from '@/core/config';
import { composeValidators, required } from '@/core/validators';
import { FormGroupFinal, NumberField } from '@/form';
import { translate } from '@/i18n';

export const CustomerAllocateCreditField: FC = () => {
  const validate = useMemo(() => composeValidators(required), []);

  return (
    <Field
      name="value"
      label={translate('Allocate credit ({currency})', {
        currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
      })}
      validate={validate}
      required
      component={FormGroupFinal}
    >
      <NumberField
        placeholder="0"
        unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
        data-testid="value"
      />
    </Field>
  );
};
