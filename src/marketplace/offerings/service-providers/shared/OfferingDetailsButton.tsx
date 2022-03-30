import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

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
        <Button className="btn-secondary btn-card">
          {translate('Details')}
        </Button>
      </Link>
    </div>
  );
