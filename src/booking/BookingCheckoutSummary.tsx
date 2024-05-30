import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { CheckoutPricingRow } from '@waldur/marketplace/deploy/CheckoutPricingRow';
import { OfferingPeriodsRenderer } from '@waldur/marketplace/details/OfferingPeriodsRenderer';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';

export const BookingExtraComponent: FunctionComponent<any> = (props) => (
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
