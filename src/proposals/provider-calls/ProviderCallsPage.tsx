import { FC } from 'react';

import { useCustomer } from '@/workspace/hooks';

import { ProviderCallsTable } from './ProviderCallsTable';

/** The provider's Calls tab: the calls its offerings are in. */
export const ProviderCallsPage: FC = () => {
  const customer = useCustomer();
  if (!customer) {
    return null;
  }
  return <ProviderCallsTable providerUuid={customer.uuid} />;
};
