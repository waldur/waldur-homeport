import * as React from 'react';

import { translate } from '@waldur/i18n';

import './Order.scss';

import { OrderItem } from './OrderItem';
import { OrderItemResponse } from './types';

interface OrderProps {
  items: OrderItemResponse[];
  editable: boolean;
  onOrderItemRemove?(item: OrderItemResponse): void;
}

export const Order = (props: OrderProps) => (
  <>
    <div className="table-responsive order">
      <table className="table">
        <thead>
          <tr>
            <th>{translate('Item')}</th>
            <th className="text-center">{translate('Price')}</th>
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
            />
          ))}
        </tbody>
      </table>
    </div>
  </>
);
