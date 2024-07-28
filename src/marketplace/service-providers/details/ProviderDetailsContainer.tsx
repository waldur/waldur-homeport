import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import {
  getPublicOfferingsList,
  getServiceProviderByCustomer,
} from '@waldur/marketplace/common/api';

import { ServiceProviderDetails } from './ServiceProviderDetails';

async function loadProviderData(customerId) {
  const provider = await getServiceProviderByCustomer({
    customer_uuid: customerId,
  });
  const offerings = await getPublicOfferingsList({
    customer_uuid: customerId,
    o: 'state',
  });
  return { provider, offerings };
}

export const ProviderDetailsContainer: React.FC<{}> = () => {
  const {
    params: { customer_uuid },
  } = useCurrentStateAndParams();

  const { isLoading, error, data } = useQuery(
    ['ProviderDetailsContainer', customer_uuid],
    () => loadProviderData(customer_uuid),
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <>{translate('Unable to load service provider.')}</>;
  }
  return (
    <ServiceProviderDetails
      provider={data.provider}
      offerings={data.offerings}
    />
  );
};
