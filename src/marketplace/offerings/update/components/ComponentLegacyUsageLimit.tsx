import { FC } from 'react';
import { useForm } from 'react-final-form';

import { AlertItem, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

import { LimitPeriodOption } from './ComponentLimitPeriodField';

const getLegacyLimitText = (amount: number, period?: string) => {
  switch (period) {
    case 'quarterly':
      return translate('Limit {amount} per quarter — not enforced', {
        amount,
      });
    case 'annual':
      return translate('Limit {amount} per year — not enforced', { amount });
    case 'total':
      return translate('Limit {amount} in total — not enforced', { amount });
    default:
      return translate('Limit {amount} per month — not enforced', { amount });
  }
};

/**
 * A `limit_amount` set on a usage-based component before spending limits
 * existed. The backend accepts and bills reports above it, so it is shown as
 * what it is and can only be cleared, not configured again.
 */
export const ComponentLegacyUsageLimit: FC<{
  amount: number;
  limitPeriod?: LimitPeriodOption;
  readOnly?: boolean;
}> = ({ amount, limitPeriod, readOnly }) => {
  const form = useForm();
  return (
    <AlertItem
      variant="warning"
      type="floating"
      className="mb-4"
      iconSize="md"
      title={getLegacyLimitText(amount, limitPeriod?.value)}
      body={translate(
        'Reports above this limit are accepted and billed. Use spending limits to cap usage.',
      )}
      actions={
        !readOnly && (
          <BaseButton
            variant="tertiary"
            size="sm"
            label={translate('Clear limit')}
            onClick={() => form.change('limit_amount', null)}
          />
        )
      }
      data-testid="legacy-usage-limit"
    />
  );
};
