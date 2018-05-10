import * as React from 'react';

import './ComparisonItem.scss';
import { ProductDetails } from './types';

interface ComparisonItemProps {
  item: ProductDetails;
}

export const ComparisonItem = (props: ComparisonItemProps) => (
  <div className="comparison-item">
    <button
      type="button"
      className="btn btn-default btn-sm">
      <i className="fa fa-trash"/>
      {' '}
      Remove from comparison
    </button>
    <a className="comparison-item-thumb">
      <img src={props.item.thumb}/>
    </a>
    <button
      type="button"
      className="btn btn-default btn-sm">
      <i className="fa fa-shopping-cart"/>
      {' '}
      Add to cart
    </button>
  </div>
);
