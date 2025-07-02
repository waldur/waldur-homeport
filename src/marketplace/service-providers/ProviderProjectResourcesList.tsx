import { FunctionComponent, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { ResourceNameField } from '../resources/list/ResourceNameField';
import { ResourceStateField } from '../resources/list/ResourceStateField';

export const ProviderProjectResourcesList: FunctionComponent<{
  project_uuid;
  provider_customer_uuid;
}> = (ownProps) => {
  const filter = useMemo(
    () => ({
      project_uuid: ownProps.project_uuid,
      provider_uuid: ownProps.provider_customer_uuid,
      state: ['OK', 'Erred', 'Creating', 'Updating', 'Terminating'],
      offering_shared: true,
    }),
    [ownProps],
  );
  const props = useTable({
    table: 'ProviderProjectResourcesList',
    fetchData: createFetcher('marketplace-resources'),
    filter,
    queryField: 'query',
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ResourceNameField,
          orderField: 'name',
        },
        {
          title: translate('Category'),
          render: ({ row }) => row.category_title,
        },
        {
          title: translate('Offering'),
          render: ({ row }) => row.offering_name,
        },
        {
          title: translate('Parent offering'),
          render: ({ row }) => row.parent_offering_name || 'N/A',
        },
        {
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <ResourceStateField resource={row} outline pill />
          ),

          orderField: 'state',
        },
      ]}
      verboseName={translate('Resources')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      showPageSizeSelector={true}
      hasActionBar={false}
    />
  );
};
