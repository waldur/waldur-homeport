import { FC } from 'react';
import { Field } from 'react-final-form';

import { ENV } from '@/core/config';
import { required } from '@/core/validators';
import { FormGroup, NumberField } from '@/form';
import { translate } from '@/i18n';

export const CustomerAllocateCreditField: FC = () => {
  return (
    <Field
      name="value"
      label={translate('Allocate credit ({currency})', {
        currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
      })}
      validate={required}
      required
      component={FormGroup}
    >
      <NumberField
        placeholder="0"
        unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
        data-testid="value"
      />
    </Field>
  );
};
