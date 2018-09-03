import * as React from 'react';

import { translate } from '@waldur/i18n';

import './ShoppingCart.scss';
import { ShoppingCartItem } from './ShoppingCartItem';
import { OrderItemResponse } from './types';

interface ShoppingCartProps {
  items: OrderItemResponse[];
  editable: boolean;
  onShoppingCartItemRemove?(item: OrderItemResponse): void;
}

export const ShoppingCart = (props: ShoppingCartProps) => (
  <>
    <div className="table-responsive shopping-cart">
      <table className="table">
        <thead>
          <tr>
            <th>{translate('Item')}</th>
            <th className="text-center">{translate('Price')}</th>
            <th>{/* Actions column */}</th>
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
  </>
);
