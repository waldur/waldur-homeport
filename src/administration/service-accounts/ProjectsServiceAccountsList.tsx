import { FC } from 'react';

import { ServiceAccountsTableComponent } from '@waldur/customer/service-accounts/ServiceAccountsList';
import { createFetcher } from '@waldur/table/api';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

export const ProjectsServiceAccountsList: FC<TableWithPortal> = ({
  portal,
}) => {
  const tableProps = useTable({
    table: `marketplace-project-service-accounts`,
    fetchData: createFetcher(`marketplace-project-service-accounts`),
    queryField: 'email',
  });

  return (
    <ServiceAccountsTableComponent
      context="project"
      {...tableProps}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
