import { FC, useMemo } from 'react';

import { composeValidators } from '@/core/validators';
import { NumberGroup } from '@/form';
import { translate } from '@/i18n';

import { validatePercent } from './constants';

export const GraceCoefficientField: FC = () => {
  const validate = useMemo(() => composeValidators(validatePercent), []);

  return (
    <NumberGroup
      name="grace_coefficient"
      label={translate('Grace coefficient')}
      validate={validate}
      placeholder="0"
      unit="%"
    />
  );
};
