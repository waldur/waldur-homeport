import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogoMetronic';
import { Offering } from '@waldur/marketplace/types';
import { wrapTooltip } from '@waldur/table/ActionButton';

import { ServiceProviderOfferingCardButtonsOverlay } from './ServiceProviderOfferingCardButtonsOverlay';

import './ServiceProviderOfferingDetailsCard.scss';

interface ServiceProviderOfferingDetailsCardProps {
  row: Offering;
}

export const ServiceProviderOfferingDetailsCard: FunctionComponent<ServiceProviderOfferingDetailsCardProps> =
  ({ row }) =>
    wrapTooltip(
      row.state === 'Paused' &&
        (row.paused_reason ||
          translate('Requesting of new resources has been temporarily paused')),
      <Link
        state="marketplace-public-offering.details"
        params={{
          uuid: row.uuid,
        }}
        className="w-100 mw-300px"
      >
        <Card
          className={classNames(
            'service-provider-offering-card card-flush shadow-sm text-dark',
            {
              disabled: row.state !== 'Active',
            },
          )}
        >
          <Card.Body>
            <div className="offering-card-body">
              <OfferingLogo src={row.thumbnail} />
              <h3 className="offering-title text-dark fw-bold text-hover-primary fs-6 mt-4">
                {row.name}
              </h3>
              <Link
                state="marketplace-service-provider.details"
                params={{ uuid: row.customer_uuid }}
                className="text-decoration-underline text-dark text-hover-primary fs-7 mb-2"
              >
                {row.customer_name}
              </Link>
              {row.description ? (
                <div className="offering-description text-gray-700 fs-7">
                  <FormattedHtml html={row.description} />
                </div>
              ) : (
                <p className="text-muted fst-italic fs-7">
                  {translate('There is no description')}
                </p>
              )}
            </div>
          </Card.Body>
          <ServiceProviderOfferingCardButtonsOverlay offering={row} />
        </Card>
      </Link>,
    );
