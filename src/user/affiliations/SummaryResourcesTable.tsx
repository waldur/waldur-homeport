import { EyeIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { MarketplaceResourcesListData, Resource } from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { ResourceNameField } from '@waldur/marketplace/resources/list/ResourceNameField';
import { ResourceStateField } from '@waldur/marketplace/resources/list/ResourceStateField';
import { getStates } from '@waldur/marketplace/resources/list/ResourceStateFilter';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { Customer } from '@waldur/workspace/types';

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

const ResourceDetailsDialog = lazyComponent(() =>
  import(
    '@waldur/marketplace/resources/details/popup/ResourceDetailsDialog'
  ).then((module) => ({
    default: module.ResourceDetailsDialog,
  })),
);

const ResourcesListActions = ({ row, fetch }) => {
  const dispatch = useDispatch();
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        ({ row }) => (
          <ActionItem
            title={translate('View details')}
            iconNode={<EyeIcon weight="bold" />}
            action={() =>
              dispatch(
                openModalDialog(ResourceDetailsDialog, {
                  resolve: { resource: row },
                  size: 'lg',
                }),
              )
            }
          />
        ),
      ]}
    />
  );
};

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
    fetchData: createFetcher('marketplace-resources'),
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
            <ResourceStateField resource={row} outline pill />
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
