import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { marketplaceProviderOfferingsList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getServiceProviderByCustomer } from '@/marketplace/common/api';
import { useTitle } from '@/navigation/title';

import { ProviderDetailsBody } from './ProviderDetailsBody';

async function loadProviderData(customer_uuid) {
  const provider = await getServiceProviderByCustomer({
    customer_uuid,
  });
  const offerings = await getAllPages((page) =>
    marketplaceProviderOfferingsList({
      query: { page, page_size: MAX_PAGE_SIZE, customer_uuid },
    }),
  );
  return { provider, offerings };
}

export const ProviderDetails: FunctionComponent = () => {
  const {
    params: { customer_uuid },
  } = useCurrentStateAndParams();

  const {
    isLoading: loading,
    data: value,
    error,
  } = useQuery({
    queryKey: ['providerDetails', customer_uuid],
    queryFn: () => loadProviderData(customer_uuid),
  });

  useTitle(
    value ? value.provider.customer_name : translate('Provider details'),
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <>{translate('Unable to load service provider.')}</>;
  }
  return <ProviderDetailsBody {...value} />;
};
