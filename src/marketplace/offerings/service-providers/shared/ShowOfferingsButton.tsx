import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import './ShowOfferingsButton.scss';
import { ServiceProvider } from '@waldur/marketplace/offerings/service-providers/types';

interface ShowOfferingsButtonProps {
  serviceProvider: ServiceProvider;
}

export const ShowOfferingsButton: FunctionComponent<ShowOfferingsButtonProps> = ({
  serviceProvider,
}) => (
  <div className="ShowOfferingsButtonContainer">
    <Link
      state="marketplace-service-provider.details"
      params={{ uuid: serviceProvider.customer_uuid }}
    >
      <button
        type="button"
        className={'btn btn-default ShowOfferingsButtonContainer__button'}
      >
        {translate('Show offerings')}
      </button>
    </Link>
  </div>
);
