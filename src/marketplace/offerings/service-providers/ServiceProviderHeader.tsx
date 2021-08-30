import { FunctionComponent } from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { ServiceProviderLogo } from '@waldur/marketplace/offerings/service-providers/shared/ServiceProviderLogo';
import { ServiceProvider } from '@waldur/marketplace/types';
import './ServiceProviderHeader.scss';

const GeorgiaNature = require('./georgia-nature.jpg');

interface ServiceProviderHeaderProps {
  serviceProvider: ServiceProvider;
}

const customerDescription = (text: string) =>
  text.length > 200 ? (
    <Tooltip label={text} id="customerDescription">
      <p>{text}</p>
    </Tooltip>
  ) : (
    text
  );

export const ServiceProviderHeader: FunctionComponent<ServiceProviderHeaderProps> = ({
  serviceProvider,
}) => (
  <div
    className="serviceProviderHeaderContainer"
    style={{ backgroundImage: `url(${GeorgiaNature})` }}
  >
    <div className="serviceProviderHeaderContainer__card">
      <div className="serviceProviderHeaderContainer__card__info">
        <h2>
          {serviceProvider.customer_abbreviation ||
            serviceProvider.customer_name}
        </h2>
        {/*{serviceProvider.description &&*/}
        {/*  customerDescription(serviceProvider.description)}*/}
        {customerDescription(
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        )}
      </div>
      <ServiceProviderLogo serviceProvider={serviceProvider} />
    </div>
  </div>
);
