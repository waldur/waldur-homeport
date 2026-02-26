import { FunctionComponent } from 'react';
import {
  marketplaceProjectUpdateRequestsList,
  RemoteProjectUpdateRequest,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { RemoteProjectUpdateRequestStateOptions } from '@waldur/table/generated/MarketplaceProjectUpdateRequestsFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { ProjectUpdateRequestActions } from './ProjectUpdateRequestActions';
import { ProjectUpdateRequestExpandable } from './ProjectUpdateRequestExpandable';

export const BaseProjectUpdateRequestsList: FunctionComponent<{
  filter;
  title?;
  filters?;
}> = ({ filter, title, filters }) => {
  const props = useTable({
    table: 'marketplace-project-update-requests',
    fetchData: createFetcher(marketplaceProjectUpdateRequestsList),
    filter,
  });
  return (
    <Table<RemoteProjectUpdateRequest>
      {...props}
      columns={[
        {
          title: translate('Organization'),
          render: ({ row }) => row.customer_name,
          filter: 'organization',
          inlineFilter: (row) => ({
            name: row.customer_name,
            uuid: row.customer_uuid,
          }),
        },
        { title: translate('Project'), render: ({ row }) => row.old_name },
        {
          title: translate('State'),
          render: ({ row }) => row.state,
          filter: 'state',
          inlineFilter: (row) =>
            RemoteProjectUpdateRequestStateOptions.filter(
              (s) => s.value === row.state,
            ),
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
        {
          title: translate('Reviewed at'),
          render: ({ row }) =>
            row.reviewed_at ? formatDateTime(row.reviewed_at) : 'N/A',
        },
        {
          title: translate('Reviewed by'),
          render: ({ row }) => row.reviewed_by_full_name || 'N/A',
        },
      ]}
      title={title || translate('Project updates')}
      rowActions={({ row }) => (
        <ProjectUpdateRequestActions request={row} refetch={props.fetch} />
      )}
      expandableRow={ProjectUpdateRequestExpandable}
      verboseName={translate('requests')}
      filters={filters}
    />
  );
};
