import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

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

export const ProviderDetails: FunctionComponent = () => {
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
    return <>{translate('Unable to load service provider.')}</>;
  }
  return <ProviderDetailsBody {...value} />;
};
