import { useFormState } from 'react-final-form';

import { WarningTip } from 'waldur-ui';

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
        <WarningTip
          label={<FieldError error={submitErrors.plan_entries} />}
          size={18}
          className="ms-2 mb-1"
          tooltipProps={{ autoWidth: true }}
        />
      )}
      {!shouldConcealPrices && (
        <div className="ms-auto text-muted">
          <PriceTooltip size={20} />
        </div>
      )}
    </>
  );
};
