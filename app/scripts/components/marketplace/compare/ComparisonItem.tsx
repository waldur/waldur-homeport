import * as React from 'react';

import { RatingStars } from '../common/RatingStars';
import { ProductDetails } from '../types';
import './ComparisonItem.scss';
import { ComparisonItemRemoveButtonContainer } from './ComparisonItemRemoveButtonContainer';

interface ComparisonItemProps {
  item: ProductDetails;
}

export const ComparisonItem = (props: ComparisonItemProps) => (
  <div className="text-center comparison-item">
    <ComparisonItemRemoveButtonContainer product={props.item}/>
    <a className="comparison-item-thumb">
      <img src={props.item.thumb}/>
    </a>
    <h3>{props.item.title}</h3>
    <p>by {props.item.vendor}</p>
    <RatingStars rating={props.item.rating} size="medium"/>
    <p>Based on <a>{props.item.reviews} reviews</a></p>
  </div>
);
