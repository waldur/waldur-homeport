import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { CheckoutPricingRow } from '@/marketplace/deploy/CheckoutPricingRow';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { OfferingPeriodsRenderer } from '@/marketplace/details/OfferingPeriodsRenderer';
import { OrderSummary } from '@/marketplace/details/OrderSummary';

const BookingExtraComponent: FunctionComponent<void> = () => {
  const { attributes = {} } = useOrderFormData();
  return (
    <>
      {attributes &&
      attributes.schedules &&
      Array.isArray(attributes.schedules) &&
      attributes.schedules.length ? (
        <CheckoutPricingRow
          label={
            attributes.schedules.length === 1
              ? translate('Period')
              : translate('Periods')
          }
          value={<OfferingPeriodsRenderer schedules={attributes.schedules} />}
        />
      ) : null}
    </>
  );
};

export const BookingCheckoutSummary: FunctionComponent<any> = (props) => (
  <OrderSummary {...props} extraComponent={BookingExtraComponent} />
);
