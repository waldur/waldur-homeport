import { FC } from 'react';

import { RadioGroup } from '@/form';
import { translate } from '@/i18n';

import { minimalConsumptionLogicOptions } from './constants';

export const MinimalConsumptionLogicField: FC = () => (
  <RadioGroup
    name="minimal_consumption_logic"
    label={translate('Minimal consumption logic')}
    direction="horizontal"
    choices={minimalConsumptionLogicOptions}
  />
);
