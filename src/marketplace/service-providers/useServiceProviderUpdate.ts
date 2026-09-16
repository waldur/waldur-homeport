import {
  marketplaceServiceProvidersPartialUpdate,
  ServiceProvider,
} from 'waldur-js-client';

import { useNotify } from '@/store/notify';

/**
 * Edit-field callback that PATCHes the service provider and stores the
 * response. Validation errors (e.g. refusing provider-level accounts while
 * usernames conflict) are surfaced as a notification, and the rejection keeps
 * the edit dialog open.
 */
export const useServiceProviderUpdate = (
  serviceProvider: ServiceProvider,
  setServiceProvider: (data: ServiceProvider) => void,
) => {
  const { showErrorResponse } = useNotify();

  return async (formData) => {
    try {
      const res = await marketplaceServiceProvidersPartialUpdate({
        path: { uuid: serviceProvider.uuid },
        body: formData,
      });
      setServiceProvider(res.data);
      return res;
    } catch (error) {
      showErrorResponse(error);
      throw error;
    }
  };
};
