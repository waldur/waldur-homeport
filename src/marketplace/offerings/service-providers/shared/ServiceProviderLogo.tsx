import { FunctionComponent } from 'react';
import PlaceholderImage from 'react-simple-svg-placeholder';

import { ServiceProvider } from '@waldur/marketplace/offerings/service-providers/types';

interface ServiceProviderLogoProps {
  serviceProvider: ServiceProvider;
}

export const ServiceProviderLogo: FunctionComponent<ServiceProviderLogoProps> = ({
  serviceProvider,
}) =>
  serviceProvider.image ? (
    /*fixme: `image` property is null for every row*/
    <img src={serviceProvider.image} />
  ) : (
    <PlaceholderImage
      width={120}
      height={70}
      text={serviceProvider.customer_name[0]}
      fontSize={60}
    />
  );
