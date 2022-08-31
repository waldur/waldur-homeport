import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogoMetronic';
import { Offering } from '@waldur/marketplace/types';
import { wrapTooltip } from '@waldur/table/ActionButton';

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
      className={classNames('offering-card d-flex align-items-center mb-6', {
        disabled: props.offering.state !== 'Active',
      })}
    >
      <OfferingLogo src={props.offering.thumbnail} />
      <div className="ms-6">
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
      </div>
    </Link>,
  );
