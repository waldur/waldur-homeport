import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { OfferingCompareButtonContainer } from '@waldur/marketplace/compare/OfferingCompareButtonContainer';

import { OfferingButton } from '../common/OfferingButton';
import { RatingStars } from '../common/RatingStars';
import { Offering } from '../types';
import './OfferingCard.scss';

interface OfferingCardProps {
  offering: Offering;
}

export const OfferingCard = (props: OfferingCardProps) => (
  <div className="offering-card">
    <Link
      state="marketplace-offering"
      params={{offering_uuid: props.offering.uuid}}
      className="offering-thumb">
      <img src={props.offering.thumbnail}/>
    </Link>
    <div className="offering-card-body">
      <h3 className="offering-title ellipsis">
        <Link
          state="marketplace-offering"
          params={{offering_uuid: props.offering.uuid}}>
          {props.offering.name}
        </Link>
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
