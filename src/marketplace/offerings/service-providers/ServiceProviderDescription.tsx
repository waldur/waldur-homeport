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
}) => (
  <div className="serviceProviderDescription">
    {serviceProvider.description &&
      customerDescription(serviceProvider.description)}
    <ServiceProviderDescriptionUpdateButton serviceProvider={serviceProvider} />
  </div>
);
