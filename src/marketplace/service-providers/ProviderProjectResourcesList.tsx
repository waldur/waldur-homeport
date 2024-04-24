import { FunctionComponent, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { EmptyResourcesListPlaceholder } from '../resources/list/EmptyResourcesListPlaceholder';
import { ResourceNameField } from '../resources/list/ResourceNameField';
import { ResourceStateField } from '../resources/list/ResourceStateField';

export const ProviderProjectResourcesList: FunctionComponent<{
  project_uuid;
  provider_uuid;
}> = (ownProps) => {
  const filter = useMemo(
    () => ({
      project_uuid: ownProps.project_uuid,
      provider_uuid: ownProps.provider_uuid,
      state: ['OK', 'Erred', 'Creating', 'Updating', 'Terminating'],
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
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceStateField resource={row} />,
        },
      ]}
      verboseName={translate('Resources')}
      placeholderComponent={<EmptyResourcesListPlaceholder />}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      showPageSizeSelector={true}
      hasActionBar={false}
    />
  );
};
