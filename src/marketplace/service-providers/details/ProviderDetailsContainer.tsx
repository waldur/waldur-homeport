import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getServiceProviderByCustomer } from '@waldur/marketplace/common/api';

import { ServiceProviderDetails } from './ServiceProviderDetails';

async function loadProviderData(customerId) {
  const provider = await getServiceProviderByCustomer({
    customer_uuid: customerId,
  });
  return { provider };
}

export const ProviderDetailsContainer: React.FC<{}> = () => {
  const {
    params: { customer_uuid },
  } = useCurrentStateAndParams();

  const { isLoading, error, data } = useQuery({
    queryKey: ['ProviderDetailsContainer', customer_uuid],
    queryFn: () => loadProviderData(customer_uuid),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <>{translate('Unable to load service provider.')}</>;
  }
  return <ServiceProviderDetails provider={data.provider} />;
};
