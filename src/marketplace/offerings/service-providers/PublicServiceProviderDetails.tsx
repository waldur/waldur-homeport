import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { clearTokenHeader } from '@waldur/auth/AuthService';
import { removeToken } from '@waldur/auth/TokenStorage';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InvalidRoutePage } from '@waldur/error/InvalidRoutePage';
import { translate } from '@waldur/i18n';
import { getServiceProviderByCustomer } from '@waldur/marketplace/common/api';
import { ServiceProvider } from '@waldur/marketplace/offerings/service-providers/ServiceProvider';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';

export const PublicServiceProviderDetails: FunctionComponent = () => {
  const dispatch = useDispatch();
  useFullPage();
  useTitle(translate('Service provider'));
  const {
    params: { uuid },
  } = useCurrentStateAndParams();
  const [{ loading, error, value: serviceProvider }, refreshServiceProvider] =
    useAsyncFn(async () => {
      try {
        const user = await getCurrentUser({ __skipLogout__: true });
        dispatch(setCurrentUser(user));
      } catch (e) {
        if (e.response.status == 401) {
          removeToken();
          clearTokenHeader();
        }
      }

      return await getServiceProviderByCustomer(
        {
          customer_uuid: uuid,
        },
        ANONYMOUS_CONFIG,
      );
    });

  useEffectOnce(() => {
    refreshServiceProvider();
  });

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <p>{translate('Unable to load the service provider.')}</p>
  ) : serviceProvider ? (
    <>
      <ServiceProvider
        serviceProvider={serviceProvider}
        refreshServiceProvider={refreshServiceProvider}
      />
    </>
  ) : (
    <InvalidRoutePage />
  );
};
