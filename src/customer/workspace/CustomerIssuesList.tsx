import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { IssuesList } from '@waldur/issues/list/IssuesList';
import { getCustomer } from '@waldur/workspace/selectors';

export const CustomerIssuesList: FC = () => {
  const customer = useSelector(getCustomer);
  const filter = useMemo(() => ({ customer: customer?.url }), [customer]);
  return (
    <IssuesList hiddenColumns={['customer']} filter={filter} scope={customer} />
  );
};
