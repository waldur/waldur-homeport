import { FunctionComponent } from 'react';

import { Logo } from '@waldur/marketplace/offerings/service-providers/shared/Logo';
import { ServiceProvider } from '@waldur/marketplace/types';

import './ServiceProviderHeader.scss';
import { ServiceProviderEditorButton } from './ServiceProviderEditorButton';

const GeorgiaNature = require('./georgia-nature.jpg');

interface ServiceProviderHeaderProps {
  serviceProvider: ServiceProvider;
  refreshServiceProvider(): void;
}

export const ServiceProviderHeader: FunctionComponent<ServiceProviderHeaderProps> =
  ({ serviceProvider, refreshServiceProvider }) => (
    <div
      className="serviceProviderHeaderContainer"
      style={{
        backgroundImage: `url(${
          serviceProvider.customer_image || GeorgiaNature
        })`,
      }}
    >
      <div className="serviceProviderHeaderContainer__card">
        <div className="serviceProviderHeaderContainer__card__info">
          <h2>
            <ServiceProviderEditorButton
              provider={serviceProvider}
              refreshServiceProvider={refreshServiceProvider}
            />
            {serviceProvider.customer_abbreviation ||
              serviceProvider.customer_name}
          </h2>
          {serviceProvider.description && <p>{serviceProvider.description}</p>}
        </div>
        <Logo
          image={serviceProvider.customer_image}
          placeholder={serviceProvider.customer_name[0]}
          height={70}
          width={120}
        />
      </div>
    </div>
  );
