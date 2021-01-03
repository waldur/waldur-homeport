import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { OfferingDetailsProps } from '@waldur/marketplace/details/OfferingDetails';
import { OfferingPeriodsRenderer } from '@waldur/marketplace/details/OfferingPeriodsRenderer';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';

export const BookingExtraComponent: FunctionComponent<any> = (props) => (
  <>
    {props.formData &&
    props.formData.attributes &&
    Array.isArray(props.formData.attributes.schedules) &&
    props.formData.attributes.schedules.length ? (
      <tr>
        <td>
          {props.formData.attributes.schedules.length === 1 ? (
            <strong>{translate('Period')}</strong>
          ) : (
            <strong>{translate('Periods')}</strong>
          )}
        </td>
        <td>
          <OfferingPeriodsRenderer
            schedules={props.formData.attributes.schedules}
          />
        </td>
      </tr>
    ) : null}
  </>
);

export const BookingCheckoutSummary: FunctionComponent<OfferingDetailsProps> = (
  props,
) => <OrderSummary {...props} extraComponent={BookingExtraComponent} />;
