import * as React from 'react';

import { translate } from '@waldur/i18n';
import { OfferingCompareButtonContainer } from '@waldur/marketplace/compare/OfferingCompareButtonContainer';
import { OfferingLink } from '@waldur/marketplace/links/OfferingLink';

import { OfferingButton } from '../common/OfferingButton';
import { RatingStars } from '../common/RatingStars';
import { Offering } from '../types';
import './OfferingCard.scss';

interface OfferingCardProps {
  offering: Offering;
}

export const OfferingCard = (props: OfferingCardProps) => (
  <div className="offering-card">
    <OfferingLink
      offering_uuid={props.offering.uuid}
      className="offering-thumb">
      <img src={props.offering.thumbnail}/>
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
      <OfferingButton icon="fa fa-comments" title={translate('Write review')}/>
      <OfferingCompareButtonContainer offering={props.offering}/>
    </div>
  </div>
);
