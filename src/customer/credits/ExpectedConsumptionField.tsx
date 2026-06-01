import { FC } from 'react';

import { ENV } from '@/core/config';
import { NumberGroup } from '@/form';
import { translate } from '@/i18n';

export const ExpectedConsumptionField: FC = () => (
  <NumberGroup
    name="expected_consumption"
    label={translate('Expected consumption (per month)')}
    description={translate('Enter the expected credit reduction per month')}
    placeholder="0"
    unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
  />
);
