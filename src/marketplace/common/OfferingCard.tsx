import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { ModelCard1 } from '@waldur/core/ModelCard1';
import { translate } from '@waldur/i18n';
import placeholder from '@waldur/images/logo_w.svg';
import { wrapTooltip } from '@waldur/table/ActionButton';

import { OfferingLink } from '../links/OfferingLink';
import { Offering } from '../types';

import './OfferingCard.scss';

interface OfferingCardProps {
  offering: Offering;
  className?: string;
}

export const OfferingCard: FunctionComponent<OfferingCardProps> = (props) =>
  wrapTooltip(
    props.offering.state === 'Paused' &&
      (props.offering.paused_reason ||
        translate('Requesting of new resources has been temporarily paused')),
    <OfferingLink
      offering_uuid={props.offering.uuid}
      className={classNames(props.className, 'offering-card', {
        disabled: props.offering.state !== 'Active',
      })}
    >
      <ModelCard1
        title={props.offering.name}
        subtitle={props.offering.customer_name}
        logo={props.offering.thumbnail}
        image={props.offering.image || placeholder}
        imageAsSvg={!props.offering.image}
        footer={
          <div className="d-flex justify-content-end gap-4">
            <OfferingLink
              offering_uuid={props.offering.uuid}
              className="btn btn-flush text-btn"
            >
              {translate('Deploy')}
            </OfferingLink>
            <Link
              state="public-offering.marketplace-public-offering"
              params={{
                uuid: props.offering.uuid,
              }}
              className="btn btn-flush text-anchor"
            >
              {translate('View offering')}
            </Link>
          </div>
        }
      />
    </OfferingLink>,
  );
