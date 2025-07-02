import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { ResourceMultiSelectAction } from '@waldur/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { CategoryColumn } from '@waldur/marketplace/types';
import { useOrganizationAndProjectFiltersForResources } from '@waldur/navigation/sidebar/resources-filter/utils';
import { useTitle } from '@waldur/navigation/title';
import { createFetcher } from '@waldur/table/api';
import { BooleanField } from '@waldur/table/BooleanField';
import { SLUG_COLUMN } from '@waldur/table/slug';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { ResourceImportButton } from '../import/ResourceImportButton';

import { AllResourcesFilter } from './AllResourcesFilter';
import { CategoryColumnField } from './CategoryColumnField';
import {
  CATEGORY_RESOURCES_ALL_FILTER_FORM_ID,
  CATEGORY_RESOURCES_TABLE_ID,
} from './constants';
import { NON_TERMINATED_STATES } from './constants';
import { CreateResourceButton } from './CreateResourceButton';
import { ExpandableResourceSummary } from './ExpandableResourceSummary';
import { ResourceActionsButton } from './ResourceActionsButton';
import { ResourceNameField } from './ResourceNameField';
import { ResourceStateField } from './ResourceStateField';
import { getStates } from './ResourceStateFilter';
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
  useTitle(
    translate('{category} resources', { category: ownProps.category_title }),
    '',
    'browser',
  );
  const filterValues: any = useSelector(
    getFormValues(CATEGORY_RESOURCES_ALL_FILTER_FORM_ID),
  );

  const filter = useMemo(() => {
    const filter: Record<string, any> = {};
    if (ownProps.category_uuid) {
      filter.category_uuid = ownProps.category_uuid;
    }
    if (filterValues?.offering) {
      filter.offering_uuid = filterValues.offering.uuid;
    }
    if (filterValues?.parent_offering) {
      filter.parent_offering_uuid = filterValues.parent_offering.uuid;
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
        filter.state = NON_TERMINATED_STATES;
      }
    }
    if (filterValues?.organization) {
      filter.customer_uuid = filterValues.organization.uuid;
    }
    return filter;
  }, [filterValues, ownProps.category_uuid]);

  const { syncResourceFilters } =
    useOrganizationAndProjectFiltersForResources('category-resources');

  const props = useTable({
    table: `${CATEGORY_RESOURCES_TABLE_ID}-${ownProps.category_uuid}`,
    fetchData: createFetcher('marketplace-resources'),
    filter,
    queryField: 'query',
    onApplyFilter: (filters, firstFetch) => {
      const organization = filters.find((item) => item.name === 'organization');
      const project = filters.find((item) => item.name === 'project');
      const formValues = {
        organization: organization?.value,
        project: project?.value,
      };
      if (firstFetch && !organization?.value && !project?.value) return;
      syncResourceFilters(formValues);
    },
    mandatoryFields: resourcesListRequiredFields(),
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
      title: translate('Backend ID'),
      render: ({ row }) => renderFieldOrDash(row.backend_id),
      id: 'backend_id',
      keys: ['backend_id'],
      optional: true,
    },
    {
      title: translate('Offering'),
      render: ({ row }) => row.offering_name,
      filter: 'offering',
      inlineFilter: (row) => ({
        name: row.offering_name,
        uuid: row.offering_uuid,
      }),
      id: 'offering',
      keys: ['offering_name'],
      export: (row) => row.offering_name,
    },
    {
      title: translate('Parent offering'),
      render: ({ row }) => row.parent_offering_name || 'N/A',
      filter: 'parent_offering',
      id: 'parent_offering',
      keys: ['parent_offering_name'],
      optional: true,
    },
    {
      title: translate('Paused'),
      render: ({ row }) => <BooleanField value={row.paused} />,
      id: 'paused',
      keys: ['paused'],
      optional: true,
    },
    {
      title: translate('Downscaled'),
      render: ({ row }) => <BooleanField value={row.downscaled} />,
      id: 'downscaled',
      keys: ['downscaled'],
      optional: true,
    },
    {
      title: translate('Restrict member access'),
      render: ({ row }) => <BooleanField value={row.restrict_member_access} />,
      id: 'restrict_member_access',
      keys: ['restrict_member_access'],
      optional: true,
    },
  ];

  ownProps.columns.map((column: CategoryColumn) => {
    columns.push({
      title: column.title,
      render: ({ row }) => CategoryColumnField({ row, column }),
      id: `category-${column.index}`,
      keys: ['backend_metadata', `category-${column.index}`],
      export: (row) => CategoryColumnField({ row, column, for_export: true }),
    });
  });
  columns.push({
    title: translate('Organization'),
    render: ({ row }) => <>{row.customer_name}</>,
    filter: 'organization',
    inlineFilter: (row) => ({
      name: row.customer_name,
      uuid: row.customer_uuid,
    }),
    id: 'organization',
    keys: ['customer_name', 'customer_uuid'],
    export: (row) => row.customer_name,
  });
  columns.push({
    title: translate('Project'),
    render: ({ row }) => <>{row.project_name}</>,
    filter: 'project',
    inlineFilter: (row) => ({ name: row.project_name, uuid: row.project_uuid }),
    id: 'project',
    keys: ['project_name', 'project_uuid'],
    export: (row) => row.project_name,
  });
  columns.push(
    {
      title: translate('State'),
      render: ({ row }) => <ResourceStateField resource={row} outline pill />,
      filter: 'state',
      orderField: 'state',
      inlineFilter: (row) => getStates().filter((op) => op.value === row.state),
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
    {
      title: translate('Termination date'),
      render: ({ row }) =>
        row.end_date ? formatDateTime(row.end_date) : 'N/A',
      id: 'end_date',
      keys: ['end_date'],
      optional: !isFeatureVisible(MarketplaceFeatures.show_resource_end_date),
    },
    SLUG_COLUMN,
  );

  const tableActions = (
    <>
      {isFeatureVisible(MarketplaceFeatures.import_resources) && (
        <ResourceImportButton category_uuid={ownProps.category_uuid} />
      )}
      <CreateResourceButton categoryUuid={ownProps.category_uuid} />
    </>
  );

  return (
    <Table
      {...props}
      title={ownProps.category_title}
      columns={columns}
      verboseName={translate('Resources')}
      rowActions={({ row }) => (
        <ResourceActionsButton row={row} refetch={props.fetch} />
      )}
      tableActions={tableActions}
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
