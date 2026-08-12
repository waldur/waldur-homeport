import { useQuery } from '@tanstack/react-query';
import { providerHelpdesksList } from 'waldur-js-client';

/**
 * Resolves the single ProviderHelpdesk registered for a service provider.
 * A provider has at most one helpdesk, so we take the first result.
 */
export const useProviderHelpdesk = (serviceProviderUuid: string) => {
  const query = useQuery({
    queryKey: ['ProviderHelpdesk', serviceProviderUuid],
    queryFn: () =>
      providerHelpdesksList({
        query: { service_provider_uuid: serviceProviderUuid },
      }).then((response) => response.data ?? []),
    enabled: Boolean(serviceProviderUuid),
  });

  return {
    helpdesk: query.data?.[0],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
