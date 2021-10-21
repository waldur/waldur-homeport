import { FunctionComponent } from 'react';

import { AuthService } from '@waldur/auth/AuthService';
import { ServiceProviderDescriptionUpdateButton } from '@waldur/marketplace/offerings/service-providers/ServiceProviderDescriptionUpdateButton';
import { ServiceProvider } from '@waldur/marketplace/types';
import './ServiceProviderDescription.scss';

interface ServiceProviderDescriptionProps {
  serviceProvider: ServiceProvider;
}

export const ServiceProviderDescription: FunctionComponent<ServiceProviderDescriptionProps> = ({
  serviceProvider,
}) => (
  <div className="serviceProviderDescription">
    {serviceProvider.description && <p>{serviceProvider.description}</p>}
    {AuthService.isAuthenticated() && (
      <ServiceProviderDescriptionUpdateButton
        serviceProvider={serviceProvider}
      />
    )}
  </div>
);
