import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { CheckoutPricingRow } from '@/marketplace/deploy/CheckoutPricingRow';
import { OfferingPeriodsRenderer } from '@/marketplace/details/OfferingPeriodsRenderer';
import { OrderSummary } from '@/marketplace/details/OrderSummary';

const BookingExtraComponent: FunctionComponent<any> = (props) => (
  <>
    {props.formData &&
    props.formData.attributes &&
    Array.isArray(props.formData.attributes.schedules) &&
    props.formData.attributes.schedules.length ? (
      <CheckoutPricingRow
        label={
          props.formData.attributes.schedules.length === 1
            ? translate('Period')
            : translate('Periods')
        }
        value={
          <OfferingPeriodsRenderer
            schedules={props.formData.attributes.schedules}
          />
        }
      />
    ) : null}
  </>
);

export const BookingCheckoutSummary: FunctionComponent<any> = (props) => (
  <OrderSummary {...props} extraComponent={BookingExtraComponent} />
);
