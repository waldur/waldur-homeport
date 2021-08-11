import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { DashboardHeader } from '@waldur/dashboard/DashboardHeader';
import { InvalidRoutePage } from '@waldur/error/InvalidRoutePage';
import { translate } from '@waldur/i18n';
import { getServiceProviderByCustomer } from '@waldur/marketplace/common/api';
import { ServiceProviderOfferingsList } from '@waldur/marketplace/offerings/service-providers/ServiceProviderOfferingsList';
import { useTitle } from '@waldur/navigation/title';

export const ServiceProvider: FunctionComponent = () => {
  useTitle(translate('Service provider'));
  const {
    params: { uuid },
  } = useCurrentStateAndParams();
  const { loading, error, value: serviceProvider } = useAsync(() =>
    getServiceProviderByCustomer({
      customer_uuid: uuid,
    }),
  );
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <p>{translate('Unable to load the service provider.')}</p>
  ) : serviceProvider ? (
    <Panel>
      <DashboardHeader
        title={serviceProvider.customer_name}
        subtitle={translate('Public offerings')}
      />
      <ServiceProviderOfferingsList
        serviceProviderUuid={serviceProvider.customer_uuid}
      />
    </Panel>
  ) : (
    <InvalidRoutePage />
  );
};
