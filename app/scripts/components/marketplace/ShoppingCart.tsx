import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';
import { ShoppingCartItem } from '@waldur/marketplace/ShoppingCartItem';
import { Product } from '@waldur/marketplace/types';

import './ShoppingCart.scss';

interface ShoppingCartProps {
  items: Product[];
  total: number;
}

export const ShoppingCart = (props: ShoppingCartProps) => (
  <>
    <div className="table-responsive shopping-cart">
      <table className="table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th className="text-center">Subtotal</th>
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
    <div className="shopping-cart-footer">
      <div className="column"/>
      <div className="column">
        <span className="text-muted">Subtotal:&nbsp; </span>
        <span>{defaultCurrency(props.total)}</span>
      </div>
    </div>
  </>
);
