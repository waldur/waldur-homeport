import * as React from 'react';

import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';

import { Provider } from '../types';
import './ProviderDescription.scss';

interface ProviderDescriptionProps {
  provider: Provider;
}

export const ProviderDescription = (props: ProviderDescriptionProps) => (
  <div className="provider-description">
    <div className="provider-description__logo">
      <OfferingLogo src={props.provider.image}/>
    </div>
    <div className="provider-description__content">
      <p>{props.provider.description}</p>
    </div>
  </div>
);
