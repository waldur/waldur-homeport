import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogoMetronic';
import { wrapTooltip } from '@waldur/table/ActionButton';

import { Offering } from '../types';

import './OfferingCard.scss';
import { OfferingCardButtonsOverlay } from './OfferingCardButtonsOverlay';
import { OfferingDescription } from './OfferingDescription';

interface OfferingCardProps {
  offering: Offering;
}

export const OfferingCard: FunctionComponent<OfferingCardProps> = (props) =>
  wrapTooltip(
    props.offering.state === 'Paused' &&
      (props.offering.paused_reason ||
        translate('Requesting of new resources has been temporarily paused')),
    <Link
      state="public.marketplace-public-offering"
      params={{
        uuid: props.offering.uuid,
      }}
    >
      <Card
        className={classNames('offering-card card-flush shadow-sm text-dark', {
          disabled: props.offering.state !== 'Active',
        })}
      >
        <Card.Body>
          <div className="offering-card-body">
            <OfferingLogo src={props.offering.thumbnail} />
            <h3 className="offering-title text-dark fw-bold text-hover-primary fs-6 mt-4">
              {props.offering.name}
            </h3>
            <Link
              state="marketplace-service-provider.details"
              params={{ uuid: props.offering.customer_uuid }}
              className="text-decoration-underline text-dark text-hover-primary fs-7 mb-2"
            >
              {props.offering.customer_name}
            </Link>
            <OfferingDescription offering={props.offering} />
          </div>
        </Card.Body>
        <OfferingCardButtonsOverlay offering={props.offering} />
      </Card>
    </Link>,
  );
