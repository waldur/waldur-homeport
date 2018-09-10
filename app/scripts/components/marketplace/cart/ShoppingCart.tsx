import * as React from 'react';

import { translate } from '@waldur/i18n';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';

import './ShoppingCart.scss';
import { ShoppingCartItem } from './ShoppingCartItem';

interface ShoppingCartProps {
  items: OrderItemResponse[];
  editable: boolean;
  onShoppingCartItemRemove?(item: OrderItemResponse): void;
}

export const ShoppingCart = (props: ShoppingCartProps) => (
  <div className="table-responsive shopping-cart">
    <table className="table">
      <thead>
        <tr>
          <th>{translate('Item')}</th>
          <th className="text-center">{translate('Price')}</th>
          {!props.editable && <th className="text-center">{translate('State')}</th>}
          {props.editable && <th className="text-center">{translate('Actions')}</th>}
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, index) => (
          <ShoppingCartItem
            key={index}
            item={item}
            editable={props.editable}
            onRemove={() => props.onShoppingCartItemRemove(item)}
          />
        ))}
      </tbody>
    </table>
  </div>
);
