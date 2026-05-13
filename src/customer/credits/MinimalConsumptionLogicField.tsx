import { FC } from 'react';
import { Field } from 'react-final-form';

import { AwesomeRadioButton } from '@/core/AwesomeRadioButton';
import { FormGroupFinal } from '@/form';
import { translate } from '@/i18n';

import { minimalConsumptionLogicOptions } from './constants';

export const MinimalConsumptionLogicField: FC = () => (
  <Field
    name="minimal_consumption_logic"
    label={translate('Minimal consumption logic')}
    component={FormGroupFinal}
  >
    <AwesomeRadioButton
      direction="horizontal"
      choices={minimalConsumptionLogicOptions}
    />
  </Field>
);
