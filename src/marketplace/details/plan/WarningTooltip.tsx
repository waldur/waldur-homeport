import { WarningCircleIcon } from '@phosphor-icons/react';
import { useFormState } from 'react-final-form';

import { Tooltip } from 'waldur-ui';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { FieldError } from '@/form';
import { PriceTooltip } from '@/price/PriceTooltip';

export const WarningTooltip = () => {
  const { submitErrors } = useFormState({
    subscription: { submitErrors: true },
  });
  const shouldConcealPrices = isFeatureVisible(
    MarketplaceFeatures.conceal_prices,
  );

  return (
    <>
      {submitErrors && 'plan_entries' in submitErrors && (
        <Tooltip
          label={<FieldError error={submitErrors.plan_entries} />}
          autoWidth
        >
          <WarningCircleIcon
            size={18}
            weight="bold"
            className="ms-2 text-warning mb-1"
          />
        </Tooltip>
      )}
      {!shouldConcealPrices && (
        <div className="ms-auto text-muted">
          <PriceTooltip size={20} />
        </div>
      )}
    </>
  );
};
