import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { OrganizationGroup } from '@waldur/marketplace/types';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

export const OrganizationGroupTypesList: FunctionComponent = () => {
  const tableProps = useTable({
    table: 'OrganizationGroupTypesList',
    fetchData: createFetcher('organization-group-types'),
    queryField: 'name',
  });

  return (
    <Table<OrganizationGroup>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
        },
      ]}
      verboseName={translate('Organization group types')}
      hasQuery={true}
    />
  );
};
