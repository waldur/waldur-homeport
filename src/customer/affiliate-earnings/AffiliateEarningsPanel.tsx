import { FC } from 'react';

import { useCustomer } from '@/workspace/hooks';

import { AffiliateEarningsList } from './AffiliateEarningsList';

export const AffiliateEarningsPanel: FC = () => {
  const customer = useCustomer();

  if (!customer?.uuid) {
    return null;
  }

  return <AffiliateEarningsList customerUuid={customer.uuid} />;
};
