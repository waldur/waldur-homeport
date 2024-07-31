import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { ResourceMultiSelectAction } from '@waldur/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { CategoryColumn } from '@waldur/marketplace/types';
import { Table, createFetcher } from '@waldur/table';
import { SLUG_COLUMN } from '@waldur/table/slug';
import { useTable } from '@waldur/table/utils';

import { ResourceImportButton } from '../import/ResourceImportButton';

import { AllResourcesFilter } from './AllResourcesFilter';
import { CategoryColumnField } from './CategoryColumnField';
import { CreateResourceButton } from './CreateResourceButton';
import { ExpandableResourceSummary } from './ExpandableResourceSummary';
import { ResourceActionsButton } from './ResourceActionsButton';
import { ResourceNameField } from './ResourceNameField';
import { ResourceStateField } from './ResourceStateField';
import { NON_TERMINATED_STATES } from './ResourceStateFilter';
import { resourcesListRequiredFields } from './utils';

interface OwnProps {
  category_uuid: string;
  category_title: string;
  columns: CategoryColumn[];
  standalone;
}

export const CategoryResourcesList: FunctionComponent<OwnProps> = (
  ownProps,
) => {
  const filterValues: any = useSelector(getFormValues('AllResourcesFilter'));

  const filter = useMemo(() => {
    const filter: Record<string, any> = {};
    if (ownProps.category_uuid) {
      filter.category_uuid = ownProps.category_uuid;
    }
    if (filterValues?.offering) {
      filter.offering_uuid = filterValues.offering.uuid;
    }
    if (filterValues?.project) {
      filter.project_uuid = filterValues.project.uuid;
    }
    if (filterValues?.runtime_state) {
      filter.runtime_state = filterValues.runtime_state.value;
    }
    if (filterValues?.state) {
      filter.state = filterValues.state.map((option) => option.value);
      if (filterValues.include_terminated) {
        filter.state = [...filter.state, 'Terminated'];
      }
    } else {
      if (!filterValues?.include_terminated) {
        filter.state = NON_TERMINATED_STATES.map((option) => option.value);
      }
    }
    if (filterValues?.organization) {
      filter.customer_uuid = filterValues.organization.uuid;
    }
    filter.field = resourcesListRequiredFields();
    return filter;
  }, [filterValues, ownProps.category_uuid]);

  const props = useTable({
    table: `UserResourcesList-${ownProps.category_uuid}`,
    fetchData: createFetcher('marketplace-resources'),
    filter,
    queryField: 'query',
  });
  const columns: any[] = [
    {
      title: translate('Name'),
      render: ResourceNameField,
      orderField: 'name',
      id: 'name',
      keys: ['name'],
      export: (row) => row.name || row.offering_name, // render as ResourceNameField label
    },
    {
      title: translate('Offering'),
      render: ({ row }) => row.offering_name,
      filter: 'offering',
      id: 'offering',
      keys: ['offering_name'],
      export: (row) => row.offering_name,
    },
  ];

  ownProps.columns.map((column: CategoryColumn) => {
    columns.push({
      title: column.title,
      render: ({ row }) => CategoryColumnField({ row, column }),
      id: `category-${column.index}`,
      keys: ['backend_metadata', `category-${column.index}`],
      export: (row) => CategoryColumnField({ row, column }),
    });
  });
  columns.push({
    title: translate('Organization'),
    render: ({ row }) => <>{row.customer_name}</>,
    filter: 'organization',
    id: 'organization',
    keys: ['customer_name'],
    export: (row) => row.customer_name,
  });
  columns.push({
    title: translate('Project'),
    render: ({ row }) => <>{row.project_name}</>,
    filter: 'project',
    id: 'project',
    keys: ['project_name'],
    export: (row) => row.project_name,
  });
  columns.push(
    {
      title: translate('State'),
      render: ({ row }) => <ResourceStateField resource={row} outline pill />,
      filter: 'state',
      id: 'state',
      keys: ['state', 'backend_metadata'],
      export: (row) =>
        row.backend_metadata?.runtime_state ||
        row.backend_metadata?.state ||
        row.state,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
      id: 'created',
      keys: ['created'],
      export: (row) => formatDateTime(row.created),
    },
    SLUG_COLUMN,
  );

  const tableActions = (
    <>
      {isFeatureVisible(MarketplaceFeatures.import_resources) && (
        <ResourceImportButton category_uuid={ownProps.category_uuid} />
      )}
      <CreateResourceButton category_uuid={ownProps.category_uuid} />
    </>
  );

  return (
    <Table
      {...props}
      title={ownProps.category_title}
      columns={columns}
      verboseName={translate('Resources')}
      hoverableRow={({ row }) => (
        <ResourceActionsButton row={row} refetch={props.fetch} />
      )}
      actions={tableActions}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      showPageSizeSelector={true}
      expandableRow={ExpandableResourceSummary}
      enableMultiSelect={true}
      enableExport
      multiSelectActions={ResourceMultiSelectAction}
      standalone={ownProps.standalone}
      minHeight={400}
      filters={<AllResourcesFilter category_uuid={ownProps.category_uuid} />}
      hasOptionalColumns
    />
  );
};
