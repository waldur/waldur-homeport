import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';
import { Product } from '@waldur/marketplace/types';

import './ShoppingCartItem.scss';

interface ShoppingCartItemProps {
  item: Product;
}

export const ShoppingCartItem = (props: ShoppingCartItemProps) => (
  <tr>
    <td>
      <div className="product-item">
        <a className="product-thumb">
          <img src={props.item.thumb}/>
        </a>
        <div className="product-info">
          <h4 className="product-title">
            <a>{props.item.title}</a>
          </h4>
          <p>
            <b>Details:</b> {props.item.subtitle}
          </p>
        </div>
      </div>
    </td>
    <td className="text-center text-lg">
      {defaultCurrency(props.item.price)}
    </td>
    <td className="text-center">
      <span className="btn-group">
        <a className="btn btn-outline btn-success">
          Edit
        </a>
      </span>
    </td>
  </tr>
);
