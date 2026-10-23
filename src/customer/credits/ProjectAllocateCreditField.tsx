import { FC, useMemo } from 'react';

import { ENV } from '@/core/config';
import { defaultCurrency } from '@/core/formatCurrency';
import {
  composeValidators,
  lessThanOrEqual,
  required,
} from '@/core/validators';
import { NumberGroup } from '@/form';
import { translate } from '@/i18n';

export const ProjectAllocateCreditField: FC<{
  organizationCredit: number | string;
  isEdit: boolean;
}> = ({ organizationCredit, isEdit }) => {
  const validate = useMemo(
    () =>
      composeValidators(
        required,
        lessThanOrEqual(Number(organizationCredit ?? 0)),
      ),
    [organizationCredit],
  );

  const credits = defaultCurrency(organizationCredit ?? 0);
  return (
    <NumberGroup
      name="value"
      label={translate('Allocate credit ({currency})', {
        currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
      })}
      description={
        isEdit
          ? translate(
              'Previously saved credit value for this organization: {credits}',
              { credits },
            )
          : translate(
              'Credits available for this organization: {customer_credit}',
              { customer_credit: credits },
            )
      }
      validate={validate}
      required
      placeholder="0"
      unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
      data-testid="value"
    />
  );
};
