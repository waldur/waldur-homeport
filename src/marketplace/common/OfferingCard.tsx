import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogoMetronic';
import { wrapTooltip } from '@waldur/table/ActionButton';

import { Offering } from '../types';

import { OfferingCardButtonsOverlay } from './OfferingCardButtonsOverlay';

import './OfferingCard.scss';

interface OfferingCardProps {
  offering: Offering;
}

export const OfferingCard: FunctionComponent<OfferingCardProps> = (props) =>
  wrapTooltip(
    props.offering.state === 'Paused' &&
      (props.offering.paused_reason ||
        translate('Requesting of new resources has been temporarily paused')),
    <Link
      state="marketplace-public-offering.details"
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
            {props.offering.description ? (
              <div className="offering-description text-gray-700 fs-7">
                <FormattedHtml html={props.offering.description} />
              </div>
            ) : (
              <p className="text-muted fst-italic fs-7">
                {'There is no description'}
              </p>
            )}
          </div>
        </Card.Body>
        <OfferingCardButtonsOverlay offering={props.offering} />
      </Card>
    </Link>,
  );
