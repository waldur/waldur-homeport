import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import * as api from '@/marketplace/common/api';
import { canRegisterServiceProviderForCustomer } from '@/marketplace/service-providers/selectors';
import { ServiceProviderManagement } from '@/marketplace/service-providers/ServiceProviderManagement';
import { ServiceProvider } from '@/marketplace/types';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

import { DisableServiceProviderButton } from './DisableServiceProviderButton';
import { RegisterServiceProviderButton } from './RegisterServiceProviderButton';

export const CustomerMarketplacePanel: FunctionComponent<{}> = () => {
  const customer = useSelector(getCustomer);
  const user = useUser();

  const { showErrorResponse } = useNotify();

  const canRegisterServiceProvider = useSelector(
    canRegisterServiceProviderForCustomer,
  );

  const queryClient = useQueryClient();
  const {
    data: serviceProvider,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ServiceProvider', customer?.uuid],

    queryFn: () =>
      customer?.uuid
        ? api.getServiceProviderByCustomer({
            customer_uuid: customer.uuid,
          })
        : null,

    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (error)
      showErrorResponse(
        error as any,
        translate('Unable to load service provider.'),
      );
  }, [error]);

  const setServiceProvider = (data: ServiceProvider) => {
    queryClient.setQueryData(['ServiceProvider', customer?.uuid], data);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  if (!customer.is_service_provider && !canRegisterServiceProvider) {
    return (
      <p className="my-3 text-muted fs-6 text-center">
        {translate('You can not register organization as a service provider')}
      </p>
    );
  } else {
    return (
      <FormTable.Card
        title={translate('Details')}
        className="card-bordered"
        actions={
          serviceProvider && user.is_staff ? (
            <DisableServiceProviderButton
              serviceProvider={serviceProvider}
              setServiceProvider={setServiceProvider}
            />
          ) : !serviceProvider && canRegisterServiceProvider ? (
            <RegisterServiceProviderButton
              setServiceProvider={setServiceProvider}
            />
          ) : null
        }
      >
        {!serviceProvider && canRegisterServiceProvider ? (
          <p className="my-3 text-muted fs-6">
            {translate(
              'You can register organization as a service provider by pressing the button',
            )}
          </p>
        ) : serviceProvider ? (
          <ServiceProviderManagement
            serviceProvider={serviceProvider}
            setServiceProvider={setServiceProvider}
          />
        ) : null}
      </FormTable.Card>
    );
  }
};
