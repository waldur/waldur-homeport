import { FC, useMemo } from 'react';
import {
  marketplaceResourcesList,
  MarketplaceResourcesListData,
  Project,
  Resource,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { ResourceNameField } from '@/marketplace/resources/list/ResourceNameField';
import { ResourceStateField } from '@/marketplace/resources/list/ResourceStateField';
import { getStates } from '@/marketplace/resources/list/ResourceStateFilter';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { Customer } from '@/workspace/types';

import { ResourcesListActions } from './ResourcesListActions';

const mandatoryFields: MarketplaceResourcesListData['query']['field'] = [
  'uuid',
  'name',
  'category_title',
  'offering_name',
  'customer_name',
  'project_name',
  'created',
  'state',
  'backend_metadata',
];

interface OwnProps {
  scope: Customer | Project;
  context: 'organization' | 'project';
}

export const SummaryResourcesTable: FC<OwnProps> = ({ scope, context }) => {
  const filter = useMemo(
    () => ({
      state: getStates().map((state) => state.value),
      ...(context === 'organization'
        ? { customer_uuid: scope.uuid }
        : { project_uuid: scope.uuid }),
    }),
    [scope],
  );
  const tableProps = useTable({
    table:
      (context === 'organization'
        ? 'OrganizationResources'
        : 'ProjectResources') +
      '-' +
      scope.uuid,
    fetchData: createFetcher(marketplaceResourcesList),
    filter,
    mandatoryFields,
  });

  return (
    <Table<Resource>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ResourceNameField,
          orderField: 'name',
        },
        {
          title: translate('Category'),
          render: ({ row }) => <>{row.category_title}</>,
        },
        {
          title: translate('Offering'),
          render: ({ row }) => <>{row.offering_name}</>,
        },
        {
          title: translate('Project'),
          render: ({ row }) => <>{row.project_name}</>,
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
      initialSorting={{ field: 'name', mode: 'asc' }}
      hasActionBar={false}
      hoverShadow={false}
      initialPageSize={5}
      minHeight="auto"
      rowActions={ResourcesListActions}
    />
  );
};
