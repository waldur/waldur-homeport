import { FC, useState } from 'react';
import { ServiceProvider } from 'waldur-js-client';

import { ProviderAccountSettings } from './ProviderAccountSettings';

interface ProviderAccountSettingsPageProps {
  provider: ServiceProvider;
}

export const ProviderAccountSettingsPage: FC<
  ProviderAccountSettingsPageProps
> = ({ provider }) => {
  // The route resolves the provider once; keep saved edits on screen.
  const [serviceProvider, setServiceProvider] = useState(provider);
  return (
    <ProviderAccountSettings
      serviceProvider={serviceProvider}
      setServiceProvider={setServiceProvider}
    />
  );
};
