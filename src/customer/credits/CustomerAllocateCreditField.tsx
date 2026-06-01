import { FC } from 'react';

import { ENV } from '@/core/config';
import { required } from '@/core/validators';
import { NumberGroup } from '@/form';
import { translate } from '@/i18n';

export const CustomerAllocateCreditField: FC = () => {
  return (
    <NumberGroup
      name="value"
      label={translate('Allocate credit ({currency})', {
        currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
      })}
      validate={required}
      required
      placeholder="0"
      unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
      data-testid="value"
    />
  );
};
