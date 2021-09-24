import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { Offering } from '@waldur/marketplace/types';
import './OfferingPurchaseButton.scss';

interface OfferingPurchaseButtonProps {
  offering: Offering;
  label: string;
}
//
export const OfferingPurchaseButton: FunctionComponent<OfferingPurchaseButtonProps> = ({
  offering,
  label,
}) => (
  <div className="offeringPurchaseButton">
    <Link
      state="marketplace-offering-user"
      params={{ offering_uuid: offering.uuid }}
    >
      <button type="button" className="btn btn-default btn-card">
        {label}
      </button>
    </Link>
  </div>
);
