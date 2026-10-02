import { useMemo } from 'react';

import { useCustomer, useUser } from '@/workspace/hooks';
import { checkServiceProviderPermission } from '@/workspace/selectors';

import { PROVIDER_CUSTOMERS_TABLE_TABS } from './utils';

/** The provider's customer lists the user may open. */
export const useProviderCustomersTabs = () => {
  const user = useUser();
  const customer = useCustomer();
  return useMemo(
    () =>
      PROVIDER_CUSTOMERS_TABLE_TABS.filter((tab) =>
        checkServiceProviderPermission(customer, user, tab.permission),
      ),
    [customer, user],
  );
};
