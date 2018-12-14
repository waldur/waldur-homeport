import * as React from 'react';

import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { OfferingCompareButtonContainer } from '@waldur/marketplace/compare/OfferingCompareButtonContainer';
import { OfferingLink } from '@waldur/marketplace/links/OfferingLink';

import { RatingStars } from '../common/RatingStars';
import { Offering } from '../types';
import './OfferingCard.scss';
import { ReviewButton } from './ReviewButton';

interface OfferingCardProps {
  offering: Offering;
}

export const OfferingCard = (props: OfferingCardProps) => (
  <div className="offering-card">
    <OfferingLink
      offering_uuid={props.offering.uuid}
      className="offering-thumb">
      <OfferingLogo src={props.offering.thumbnail}/>
    </OfferingLink>
    <div className="offering-card-body">
      <h3 className="offering-title ellipsis">
        <OfferingLink offering_uuid={props.offering.uuid}>
          {props.offering.name}
        </OfferingLink>
      </h3>
      {props.offering.description && (
        <div className="offering-description ellipsis">
          {props.offering.description}
        </div>
      )}
      {props.offering.rating && (
        <RatingStars rating={props.offering.rating}/>
      )}
      {props.offering.order_item_count ? (
        <span className="offering-installs">
          {props.offering.order_item_count} installs
        </span>
      ) : null}
    </div>
    <div className="offering-button-group">
      <ReviewButton/>
      <OfferingCompareButtonContainer offering={props.offering}/>
    </div>
  </div>
);
