import { FC } from 'react';

import { CreditsListTable } from '@waldur/customer/credits/CreditsListTable';
import { createFetcher } from '@waldur/table';
import { TableProps } from '@waldur/table/Table';
import { useTable } from '@waldur/table/utils';

export const OrganizationCreditsList: FC<Partial<TableProps>> = (props) => {
  const tableProps = useTable({
    table: 'OrganizationCreditsList',
    fetchData: createFetcher('customer-credits'),
    queryField: 'query',
  });

  return <CreditsListTable {...tableProps} {...props} />;
};
