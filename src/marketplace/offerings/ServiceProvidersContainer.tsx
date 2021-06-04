import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { Panel } from '@waldur/core/Panel';
import { DashboardHeader } from '@waldur/dashboard/DashboardHeader';
import { translate } from '@waldur/i18n';
import { ServiceProvidersList } from '@waldur/marketplace/offerings/ServiceProvidersList';
import { useTitle } from '@waldur/navigation/title';

export const ServiceProvidersContainer: FunctionComponent = () => {
  const title = translate('Service providers in {title}', {
    title: ENV.shortPageTitle,
  });
  useTitle(title);
  return (
    <Panel>
      <DashboardHeader title={title} />
      <ServiceProvidersList />
    </Panel>
  );
};
