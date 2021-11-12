import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import './ShowOfferingsButton.scss';
import { Offering } from '@waldur/marketplace/types';

interface OfferingDetailsButtonProps {
  offering: Offering;
}

export const OfferingDetailsButton: FunctionComponent<OfferingDetailsButtonProps> =
  ({ offering }) => (
    <div className="offeringDetailsButton m-b">
      <Link
        state="marketplace-public-offering.details"
        params={{ uuid: offering.uuid }}
      >
        <button type="button" className="btn btn-default btn-card">
          {translate('Details')}
        </button>
      </Link>
    </div>
  );
