import { FC } from 'react';

import { ENV } from '@/core/config';
import { required } from '@/core/validators';
import { NumberGroup } from '@/form';
import { translate } from '@/i18n';

/**
 * The credit's value. Writing it is an untyped change, which the backend
 * books as granted credit, so the field says so and points prepayments to
 * the top-up instead. An edit sets the total, as the row it edits shows it.
 */
export const CustomerAllocateCreditField: FC<{ isEdit?: boolean }> = ({
  isEdit,
}) => {
  const currency = ENV.plugins.WALDUR_CORE.CURRENCY_NAME;
  return (
    <NumberGroup
      name="value"
      label={
        isEdit
          ? translate('Total credit ({currency})', { currency })
          : translate('Allocate credit ({currency})', { currency })
      }
      description={
        isEdit
          ? translate(
              'A change is added to or taken from granted credit, and can lower the total only by the granted credit left. Record a prepayment with Top up instead.',
            )
          : translate(
              'Recorded as granted credit: it is spent first and expires on the end date. To record a prepayment, create the credit with 0 and top it up.',
            )
      }
      validate={required}
      required
      placeholder="0"
      unit={currency}
      data-testid="value"
    />
  );
};
