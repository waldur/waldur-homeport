import * as React from 'react';

import { Product } from '@waldur/marketplace/types';

interface Feature {
  name: string;
  value: string | number;
}

interface CheckoutProductItemProps {
  product: Product;
  quantity: number;
  subtotal: number;
  features: Feature[];
}

export const CheckoutProductItem = (props: CheckoutProductItemProps) => (
  <tr>
    <td>
      <div className="product-item">
        <a className="product-thumb">
          <img src={props.product.thumb}/>
        </a>
        <div className="product-info">
          <h4 className="product-title">
            <a href="shop-single.html">
              {props.product.title}
              {' '}
              <small>x {props.quantity}</small>
            </a>
          </h4>
          {props.features.map((feature, index) => (
            <span key={index}>
              <em>{feature.name}:</em> {feature.value}
            </span>
          ))}
        </div>
      </div>
    </td>
    <td className="text-center text-lg">
      {props.subtotal}
    </td>
    <td className="text-center">
      <a className="btn btn-outline-primary btn-sm">Edit</a>
    </td>
  </tr>
);
