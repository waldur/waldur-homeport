import { FC } from 'react';
import { marketplaceCustomerServiceAccountsList } from 'waldur-js-client';

import { ServiceAccountsTableComponent } from '@/customer/service-accounts/ServiceAccountsList';
import { createFetcher } from '@/table/api';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';

export const OrganizationsServiceAccountsList: FC<TableWithPortal> = ({
  portal,
}) => {
  const tableProps = useTable({
    table: `marketplace-customer-service-accounts`,
    fetchData: createFetcher(marketplaceCustomerServiceAccountsList),
    queryField: 'email',
  });

  return (
    <ServiceAccountsTableComponent
      context="customer"
      {...tableProps}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
