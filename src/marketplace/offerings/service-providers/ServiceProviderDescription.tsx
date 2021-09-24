import { FunctionComponent } from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { ServiceProviderDescriptionUpdateButton } from '@waldur/marketplace/offerings/service-providers/ServiceProviderDescriptionUpdateButton';
import { ServiceProvider } from '@waldur/marketplace/types';
import './ServiceProviderDescription.scss';

const customerDescription = (text: string) =>
  text.length > 200 ? (
    <Tooltip label={text} id="customerDescription">
      <p>{text}</p>
    </Tooltip>
  ) : (
    text
  );

interface ServiceProviderDescriptionProps {
  serviceProvider: ServiceProvider;
}

export const ServiceProviderDescription: FunctionComponent<ServiceProviderDescriptionProps> = ({
  serviceProvider,
}) => {
  // eslint-disable-next-line no-console
  console.log('serviceProvider', serviceProvider);
  return (
    <div className="serviceProviderDescription">
      {/*{serviceProvider.description &&*/}
      {/*  customerDescription(serviceProvider.description)}*/}
      {customerDescription(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      )}
      <ServiceProviderDescriptionUpdateButton
        serviceProvider={serviceProvider}
      />
    </div>
  );
};
