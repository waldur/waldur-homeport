import { FC } from 'react';

import { BooleanGroup } from '@/form';
import { translate } from '@/i18n';

export const ApplyAsMinimalConsumptionField: FC = () => (
  <BooleanGroup
    name="apply_as_minimal_consumption"
    type="checkbox"
    label={translate('Apply as minimal consumption')}
  />
);
