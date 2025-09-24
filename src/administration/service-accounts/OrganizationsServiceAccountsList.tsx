import { FC } from 'react';
import { marketplaceCustomerServiceAccountsList } from 'waldur-js-client';

import { ServiceAccountsTableComponent } from '@waldur/customer/service-accounts/ServiceAccountsList';
import { createFetcher } from '@waldur/table/api';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

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
