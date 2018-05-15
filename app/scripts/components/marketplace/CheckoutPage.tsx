import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { CheckoutProductItem } from './CheckoutProductItem';

const CheckoutPage = props => (
  <div>
    <h4>Review Your Order</h4>
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
            <CheckoutProductItem
              key={index}
              product={item.product}
              quantity={item.quantity}
              subtotal={item.subtotal}
              features={item.features}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default connectAngularComponent(CheckoutPage);
