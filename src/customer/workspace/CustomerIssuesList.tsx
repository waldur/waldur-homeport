import { FC, useMemo } from 'react';

import { IssuesList } from '@/issues/list/IssuesList';
import { useCustomer } from '@/workspace/hooks';

export const CustomerIssuesList: FC = () => {
  const customer = useCustomer();
  const filter = useMemo(() => ({ customer: customer?.url }), [customer]);
  return (
    <IssuesList
      hiddenColumns={['customer']}
      filter={filter}
      scope={customer}
      scopeType="customer"
      standalone={false}
    />
  );
};
