import * as React from 'react';

import './ComparisonItem.scss';
import { RatingStars } from './RatingStars';
import { ProductDetails } from './types';

interface ComparisonItemProps {
  item: ProductDetails;
}

export const ComparisonItem = (props: ComparisonItemProps) => (
  <div className="text-center comparison-item">
    <a className="text-muted comparison-item-close"
      title="Remove from comparison">
      <i className="fa fa-close"/>
    </a>
    <a className="comparison-item-thumb">
      <img src={props.item.thumb}/>
    </a>
    <h3>{props.item.title}</h3>
    <p>by {props.item.vendor}</p>
    <RatingStars rating={props.item.rating} size="medium"/>
    <p>Based on <a>{props.item.reviews} reviews</a></p>
  </div>
);
