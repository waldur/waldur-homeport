import { FunctionComponent, useMemo } from 'react';
import { marketplaceResourcesList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

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
    fetchData: createFetcher(marketplaceResourcesList),
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
          render: ({ row }) => renderFieldOrDash(row.parent_offering_name),
        },
        {
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <ResourceStateField resource={row} pill outline />
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
