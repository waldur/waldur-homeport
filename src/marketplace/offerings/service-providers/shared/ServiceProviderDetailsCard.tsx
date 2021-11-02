import { FunctionComponent } from 'react';
import './ServiceProviderDetailsCard.scss';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { CountryFlag } from '@waldur/marketplace/offerings/service-providers/shared/CountryFlag';
import { Division } from '@waldur/marketplace/offerings/service-providers/shared/Division';
import { Logo } from '@waldur/marketplace/offerings/service-providers/shared/Logo';
import { ShowOfferingsButton } from '@waldur/marketplace/offerings/service-providers/shared/ShowOfferingsButton';
import { ServiceProvider } from '@waldur/marketplace/types';

interface ServiceProviderDetailsCardProps {
  row: ServiceProvider;
}

const descriptionText = (text: string) =>
  text.length > 40 ? (
    <Tooltip label={text} id="descriptionText">
      <span className="detailsCardContainer__description--ellipsis">
        {text}
      </span>
    </Tooltip>
  ) : (
    text
  );

export const ServiceProviderDetailsCard: FunctionComponent<ServiceProviderDetailsCardProps> =
  ({ row }) => (
    <div className="detailsCardContainer">
      <div className="detailsCardContainer__header">
        <Logo
          image={row.customer_image}
          placeholder={row.customer_name[0]}
          height={70}
          width={120}
        />
        {row.country && <CountryFlag countryCode={row.country} />}
      </div>
      <p className="card-title">
        {row.customer_abbreviation || row.customer_name}
      </p>
      {row.customer_abbreviation && (
        <div>
          <span className="font-bold">{translate('Full name:')}</span>
          <br />
          {row.customer_name}
        </div>
      )}
      {row.description && (
        <p className="detailsCardContainer__description">
          {descriptionText(row.description)}
        </p>
      )}
      <Division division={row.division} />
      <ShowOfferingsButton serviceProvider={row} />
    </div>
  );
