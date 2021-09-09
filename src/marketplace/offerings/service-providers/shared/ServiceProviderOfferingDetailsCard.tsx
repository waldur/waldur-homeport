import { FunctionComponent } from 'react';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { Divisions } from '@waldur/marketplace/offerings/service-providers/shared/Divisions';
import { OfferingDetailsButton } from '@waldur/marketplace/offerings/service-providers/shared/OfferingDetailsButton';
import { OfferingLogo } from '@waldur/marketplace/offerings/service-providers/shared/OfferingLogo';
import { OfferingPurchaseButton } from '@waldur/marketplace/offerings/service-providers/shared/OfferingPurchaseButton';
import { Offering } from '@waldur/marketplace/types';
import './ServiceProviderOfferingDetailsCard.scss';

interface ServiceProviderOfferingDetailsCardProps {
  row: Offering;
}

export const ServiceProviderOfferingDetailsCard: FunctionComponent<ServiceProviderOfferingDetailsCardProps> = ({
  row,
}) => (
  <div className="offeringCard">
    <OfferingLogo offering={row} />
    <div className="card-title m-t-sm">{row.name}</div>
    <div className="offeringCard__description m-t-xs">
      <FormattedHtml html={row.description} />
    </div>
    <div className="offeringCard__contentAlwaysOnBottom m-t">
      <Divisions divisions={row.divisions} />
      <OfferingDetailsButton offering={row} />
      <OfferingPurchaseButton
        offering={row}
        label={
          row.type === OFFERING_TYPE_BOOKING
            ? translate('Book')
            : translate('Purchase')
        }
      />
    </div>
  </div>
);
