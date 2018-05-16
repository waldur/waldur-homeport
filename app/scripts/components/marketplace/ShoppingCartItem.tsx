import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';
import { Product } from '@waldur/marketplace/types';

import './ShoppingCartItem.scss';
import { ShoppingCartItemDeleteButton } from './ShoppingCartItemDeleteButton';

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
          {props.item.features && props.item.features.map((feature, index) => (
            <span key={index}>
              <em>{feature.name}:</em> {feature.value}
            </span>
          ))}
        </div>
      </div>
    </td>
    <td className="text-center text-lg">
      {defaultCurrency(props.item.price)}
    </td>
    <td className="text-center">
      <span className="btn-group">
        <a className="btn btn-default btn-sm">
          <i className="fa fa-edit"/>
          {' '}
          Edit
        </a>
        <ShoppingCartItemDeleteButton item={props.item}/>
      </span>
    </td>
  </tr>
);
