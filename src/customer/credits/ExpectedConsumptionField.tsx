import { FC } from 'react';
import { Field } from 'react-final-form';

import { ENV } from '@/core/config';
import { FormGroupFinal, NumberField } from '@/form';
import { translate } from '@/i18n';

export const ExpectedConsumptionField: FC = () => (
  <Field
    name="expected_consumption"
    label={translate('Expected consumption (per month)')}
    description={translate('Enter the expected credit reduction per month')}
    component={FormGroupFinal}
  >
    <NumberField placeholder="0" unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME} />
  </Field>
);
