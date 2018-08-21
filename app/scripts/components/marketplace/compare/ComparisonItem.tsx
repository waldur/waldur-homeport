import * as React from 'react';

import { Link } from '@waldur/core/Link';

import { RatingStars } from '../common/RatingStars';
import { Offering } from '../types';
import './ComparisonItem.scss';
import { ComparisonItemRemoveButtonContainer } from './ComparisonItemRemoveButtonContainer';

interface ComparisonItemProps {
  item: Offering;
}

export const ComparisonItem = (props: ComparisonItemProps) => (
  <div className="text-center comparison-item">
    <ComparisonItemRemoveButtonContainer offering={props.item}/>
    <Link
      state="marketplace-offering"
      params={{offering_uuid: props.item.uuid}}
      className="comparison-item-thumb">
      <img src={props.item.thumbnail}/>
    </Link>
    <h3>{props.item.name}</h3>
    <p>by{' '}
      <Link
        state="marketplace-provider-details"
        params={{customer_uuid: props.item.customer_uuid}}>
        {props.item.customer_name}
      </Link>
    </p>
    <RatingStars rating={props.item.rating} size="medium"/>
    <p>Based on <a>{props.item.reviews} reviews</a></p>
  </div>
);
