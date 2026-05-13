import { FC } from 'react';
import { Field } from 'react-final-form';

import { FormGroupFinal } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';

export const ApplyAsMinimalConsumptionField: FC = () => (
  <Field
    name="apply_as_minimal_consumption"
    component={FormGroupFinal}
    type="checkbox"
  >
    <AwesomeCheckboxField label={translate('Apply as minimal consumption')} />
  </Field>
);
