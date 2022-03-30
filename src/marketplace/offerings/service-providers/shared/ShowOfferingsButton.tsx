import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import './ShowOfferingsButton.scss';
import { ServiceProvider } from '@waldur/marketplace/types';

interface ShowOfferingsButtonProps {
  serviceProvider: ServiceProvider;
}

export const ShowOfferingsButton: FunctionComponent<ShowOfferingsButtonProps> =
  ({ serviceProvider }) => (
    <div className="showOfferingsButtonContainer">
      <Link
        state="marketplace-service-provider.details"
        params={{ uuid: serviceProvider.customer_uuid }}
      >
        <Button className="btn-secondary btn-card">
          {translate('Show offerings')}
        </Button>
      </Link>
    </div>
  );
