import * as React from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { BillingPeriod } from '@waldur/marketplace/common/BillingPeriod';
import { getCustomer } from '@waldur/workspace/selectors';

import { OrderItem } from './item/details/OrderItem';
import './Order.scss';
import { OrderItemResponse } from './types';

interface OrderProps {
  items: OrderItemResponse[];
  editable: boolean;
  onOrderItemRemove?(item: OrderItemResponse): void;
  project_uuid: string;
}

export const Order = (props: OrderProps) => {
  const customer = useSelector(getCustomer);
  const activeFixedPricePaymentProfile = getActiveFixedPricePaymentProfile(
    customer.payment_profiles,
  );
  return (
    <>
      <div className="table-responsive order">
        <table className="table">
          <thead>
            <tr>
              <th>{translate('Item')}</th>
              {!activeFixedPricePaymentProfile ? (
                <th className="text-center">
                  <BillingPeriod unit={props.items[0].plan_unit} />
                </th>
              ) : null}
              <th className="text-center">{translate('State')}</th>
              <th>{/* Actions column */}</th>
            </tr>
          </thead>
          <tbody>
            {props.items.map((item, index) => (
              <OrderItem
                key={index}
                item={item}
                editable={props.editable}
                project_uuid={props.project_uuid}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
