import * as classNames from 'classnames';
import * as React from 'react';

import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { OfferingCompareButtonContainer } from '@waldur/marketplace/compare/OfferingCompareButtonContainer';
import { OfferingLink } from '@waldur/marketplace/links/OfferingLink';
import { wrapTooltip } from '@waldur/table-react/ActionButton';

import { Offering } from '../types';

import './OfferingCard.scss';
import { ReviewButton } from './ReviewButton';

interface OfferingCardProps {
  offering: Offering;
}

export const OfferingCard = (props: OfferingCardProps) =>
  wrapTooltip(
    props.offering.state === 'Paused' && props.offering.paused_reason,
    <div
      className={classNames('offering-card', {
        disabled: props.offering.state !== 'Active',
      })}
    >
      <OfferingLink
        offering_uuid={props.offering.uuid}
        className="offering-thumb"
      >
        <OfferingLogo src={props.offering.thumbnail} />
      </OfferingLink>
      <div className="offering-card-body">
        <h3 className="offering-title">
          <OfferingLink offering_uuid={props.offering.uuid}>
            {props.offering.name}
          </OfferingLink>
        </h3>
      </div>
      <div className="offering-button-group">
        <ReviewButton />
        <OfferingCompareButtonContainer offering={props.offering} />
      </div>
    </div>,
  );
