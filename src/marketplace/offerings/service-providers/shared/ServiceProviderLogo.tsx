import { FunctionComponent } from 'react';
import PlaceholderImage from 'react-simple-svg-placeholder';

import { ServiceProvider } from '@waldur/marketplace/types';

interface ServiceProviderLogoProps {
  serviceProvider: ServiceProvider;
}

export const ServiceProviderLogo: FunctionComponent<ServiceProviderLogoProps> = ({
  serviceProvider,
}) =>
  serviceProvider.customer_image ? (
    <img src={serviceProvider.customer_image} height={70} width="auto" />
  ) : (
    <PlaceholderImage
      width={120}
      height={70}
      text={serviceProvider.customer_name[0]}
      fontSize={60}
    />
  );
