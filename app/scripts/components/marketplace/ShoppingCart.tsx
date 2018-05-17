import * as React from 'react';

import { ShoppingCartItem } from '@waldur/marketplace/ShoppingCartItem';
import { Product } from '@waldur/marketplace/types';

import './ShoppingCart.scss';

interface ShoppingCartProps {
  items: Product[];
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
            <ShoppingCartItem key={index} item={item}/>
          ))}
        </tbody>
      </table>
    </div>
  </>
);
