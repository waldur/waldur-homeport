import * as React from 'react';

import './ShoppingCart.scss';
import { ShoppingCartItem } from './ShoppingCartItem';
import { OrderItem } from './types';

interface ShoppingCartProps {
  items: OrderItem[];
  editable: boolean;
}

export const ShoppingCart = (props: ShoppingCartProps) => (
  <>
    <div className="table-responsive shopping-cart">
      <table className="table">
        <thead>
          <tr>
            <th>Item</th>
            <th className="text-center">Price</th>
            <th>{/* Actions column */}</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, index) => (
            <ShoppingCartItem
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
