import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InvalidRoutePage } from '@waldur/error/InvalidRoutePage';
import { translate } from '@waldur/i18n';
import { getServiceProviderByCustomer } from '@waldur/marketplace/common/api';
import { ServiceProvider } from '@waldur/marketplace/offerings/service-providers/ServiceProvider';
import { AnonymousHeader } from '@waldur/navigation/AnonymousHeader';
import { useTitle } from '@waldur/navigation/title';

export const ServiceProviderContainer: FunctionComponent = () => {
  useTitle(translate('Service provider'));
  const {
    params: { uuid },
  } = useCurrentStateAndParams();
  const [{ loading, error, value: serviceProvider }, refreshServiceProvider] =
    useAsyncFn(() =>
      getServiceProviderByCustomer({
        customer_uuid: uuid,
      }),
    );

  useEffectOnce(() => {
    refreshServiceProvider();
  });

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <p>{translate('Unable to load the service provider.')}</p>
  ) : serviceProvider ? (
    <>
      <AnonymousHeader />
      <ServiceProvider
        serviceProvider={serviceProvider}
        refreshServiceProvider={refreshServiceProvider}
      />
    </>
  ) : (
    <InvalidRoutePage />
  );
};
