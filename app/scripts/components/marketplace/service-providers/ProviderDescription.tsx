import * as React from 'react';

import { Provider } from '../types';

import './ProviderDescription.scss';

interface ProviderDescriptionProps {
  provider: Provider;
}

export const ProviderDescription: React.SFC<ProviderDescriptionProps> = (props: ProviderDescriptionProps) => (
  <div className="provider-description">
    <div className="provider-description__logo">
      <img src={props.provider.image}/>
    </div>
    <div className="provider-description__content">
      <p>{props.provider.description}</p>
    </div>
  </div>
);
