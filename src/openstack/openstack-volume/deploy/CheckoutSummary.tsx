import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { CheckoutFooter } from '@waldur/marketplace/deploy/CheckoutFooter';
import { CheckoutPricingRow } from '@waldur/marketplace/deploy/CheckoutPricingRow';
import {
  formErrorsSelector,
  formIsValidSelector,
} from '@waldur/marketplace/deploy/utils';
import { OrderSubmitButton } from '@waldur/marketplace/details/OrderSubmitButton';
import { pricesSelector } from '@waldur/marketplace/details/plan/utils';
import { Offering } from '@waldur/marketplace/types';
import {
  orderFormAttributesSelector,
  orderFormDataSelector,
} from '@waldur/marketplace/utils';
import { RootState } from '@waldur/store/reducers';

const getDailyPrice = (attributesData, components) => {
  /**
   * In Marketplace OpenStack plugin storage prices are stored per GB.
   * But in UI storage is storead in MB.
   * Therefore we should convert storage from GB to MB for price estimatation.
   */

  if (!components || !attributesData.size) {
    return 0;
  }
  const size = attributesData.size / 1024.0;
  const component = attributesData.type
    ? `gigabytes_${attributesData.type.name}`
    : 'storage';
  return size * (components[component] || 0);
};

interface CheckoutSummaryProps {
  offering: Offering;
  updateMode?: boolean;
}

export const CheckoutSummary = ({
  offering,
  updateMode,
}: CheckoutSummaryProps) => {
  const formIsValid = useSelector(formIsValidSelector);
  const formAttributesData = useSelector(orderFormAttributesSelector);
  const formData = useSelector(orderFormDataSelector);
  const errors = useSelector(formErrorsSelector);

  const prices = useSelector((state: RootState) =>
    pricesSelector(state, { offering }),
  );
  const components = useMemo(
    () => (offering.plans.length > 0 ? offering.plans[0].prices : {}),
    [offering],
  );
  const dailyPrice = useMemo(
    () => getDailyPrice(formAttributesData, components),
    [formAttributesData, components],
  );

  return (
    <>
      <div className="block-summary bg-gray-100 mb-10 fs-8 fw-bold">
        {formAttributesData.name && (
          <CheckoutPricingRow
            label={translate('Name')}
            value={formAttributesData.name}
          />
        )}
        {formAttributesData.size && (
          <CheckoutPricingRow
            label={translate('Storage')}
            value={formatFilesize(formAttributesData.size)}
          />
        )}
        <CheckoutFooter
          dailyPrice={dailyPrice}
          totalPrice={prices.total}
          offering={offering}
        />
      </div>

      <OrderSubmitButton
        formData={formData}
        updateMode={updateMode}
        offering={offering}
        errors={errors}
        formValid={formIsValid}
      />
    </>
  );
};
