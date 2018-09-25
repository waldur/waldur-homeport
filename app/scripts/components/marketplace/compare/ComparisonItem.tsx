import * as React from 'react';

import { OfferingLink } from '@waldur/marketplace/common/OfferingLink';
import { ProviderLink } from '@waldur/marketplace/service-providers/ProviderLink';

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
    <OfferingLink
      offering_uuid={props.item.uuid}
      className="comparison-item-thumb">
      <img src={props.item.thumbnail}/>
    </OfferingLink>
    <h3>{props.item.name}</h3>
    <p>by{' '}
      <ProviderLink customer_uuid={props.item.customer_uuid}>
        {props.item.customer_name}
      </ProviderLink>
    </p>
    {props.item.rating &&
      <RatingStars rating={props.item.rating} size="medium"/>
    }
    {props.item.reviews &&
      <p>Based on <a>{props.item.reviews} reviews</a></p>
    }
  </div>
);
