import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import {
  getServiceProviderByCustomer,
  getProviderOfferings,
} from '@waldur/marketplace/common/api';
import { useTitle } from '@waldur/navigation/title';

import { ProviderDetailsBody } from './ProviderDetailsBody';

async function loadData(customerId) {
  const provider = await getServiceProviderByCustomer({
    customer_uuid: customerId,
  });
  const offerings = await getProviderOfferings(customerId);
  return { provider, offerings };
}

export const ProviderDetails = () => {
  const {
    params: { customer_uuid },
  } = useCurrentStateAndParams();

  const { loading, value, error } = useAsync(() => loadData(customer_uuid), [
    customer_uuid,
  ]);

  useTitle(value ? value.provider.name : translate('Provider details'));

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <span>{translate('Unable to load service provider.')}</span>;
  }
  return <ProviderDetailsBody {...value} />;
};
