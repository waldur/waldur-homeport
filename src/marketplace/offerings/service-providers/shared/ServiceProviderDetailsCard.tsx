import { FunctionComponent } from 'react';
import './ServiceProviderDetailsCard.scss';

import { translate } from '@waldur/i18n';
import { CountryFlag } from '@waldur/marketplace/offerings/service-providers/shared/CountryFlag';
import { ServiceProviderLogo } from '@waldur/marketplace/offerings/service-providers/shared/ServiceProviderLogo';
import { ShowOfferingsButton } from '@waldur/marketplace/offerings/service-providers/shared/ShowOfferingsButton';
import { Tag } from '@waldur/marketplace/offerings/service-providers/shared/Tag';
import { ServiceProvider } from '@waldur/marketplace/offerings/service-providers/types';

interface ServiceProviderDetailsCardProps {
  row: ServiceProvider;
}

export const ServiceProviderDetailsCard: FunctionComponent<ServiceProviderDetailsCardProps> = ({
  row,
}) => (
  <div className="detailsCardContainer">
    <div className="detailsCardContainer__header">
      <ServiceProviderLogo serviceProvider={row} />
      {row.country && <CountryFlag countryCode={row.country} />}
    </div>
    {row.customer_abbreviation && (
      <p className="detailsCardContainer__abbreviation">
        {row.customer_abbreviation}
      </p>
    )}
    <div className="detailsCardContainer__fullName">
      <span>{translate('Full name:')}</span>
      <br />
      {row.customer_name}
    </div>
    <p className="detailsCardContainer__description">
      {row.description || 'description text'}
    </p>
    {/*fixme `divisions` property is missing from the api endpoint*/}
    <Tag text={'public sector'} />
    <ShowOfferingsButton serviceProvider={row} />
  </div>
);
