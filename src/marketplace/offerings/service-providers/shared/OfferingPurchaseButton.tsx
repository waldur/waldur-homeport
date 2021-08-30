import { FunctionComponent } from 'react';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import './OfferingPurchaseButton.scss';

interface OfferingPurchaseButtonProps {
  offering: Offering;
}

export const OfferingPurchaseButton: FunctionComponent<OfferingPurchaseButtonProps> = ({
  offering,
}) => (
  <div className="offeringPurchaseButton">
    <Link
      state="marketplace-offering-user"
      params={{ offering_uuid: offering.uuid }}
    >
      <button type="button" className="btn btn-default btn-card">
        {offering.type === OFFERING_TYPE_BOOKING
          ? translate('Book')
          : translate('Purchase')}
      </button>
    </Link>
  </div>
);
