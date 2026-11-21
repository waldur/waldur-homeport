import { FC } from 'react';

import { BooleanGroup } from '@/form';
import { translate } from '@/i18n';

export const ComponentIncreaseOnlyField: FC = () => (
  <BooleanGroup
    name="limit_increase_only"
    label={translate('Increase only')}
    description={translate(
      'Customers can raise this limit but not lower it. Service providers and staff can still lower it.',
    )}
    space={4}
  />
);
