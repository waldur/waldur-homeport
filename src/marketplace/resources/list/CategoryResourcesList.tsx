import { FunctionComponent, useMemo } from 'react';
import { marketplaceResourcesList, NestedColumn } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { ResourceTerminationDateField } from '@/marketplace/resources/list/ResourceTerminationDateField';
import { ResourceMultiSelectAction } from '@/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { useOrganizationAndProjectAutocompletesForResources } from '@/navigation/sidebar/resources-filter/utils';
import { useTitle } from '@/navigation/title';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import { SLUG_COLUMN } from '@/table/slug';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { ResourceImportButton } from '../import/ResourceImportButton';

import { AllResourcesFilter } from './AllResourcesFilter';
import { CategoryColumnField } from './CategoryColumnField';
import {
  CATEGORY_RESOURCES_ALL_FILTER_FORM_ID,
  CATEGORY_RESOURCES_TABLE_ID,
  NON_TERMINATED_STATES,
} from './constants';
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
  columns: NestedColumn[];
  standalone;
}

export const CategoryResourcesList: FunctionComponent<OwnProps> = ({
  ...ownProps
}) => {
  useTitle(
    translate('{category} resources', { category: ownProps.category_title }),
    '',
    'browser',
  );
  const values = useFilterValues(
    `${CATEGORY_RESOURCES_TABLE_ID}-${ownProps.category_uuid}`,
  );
  const filterValues: any = values;

  const filter = useMemo(() => {
    const filterObj: Record<string, any> = {};
    if (ownProps.category_uuid) {
      filterObj.category_uuid = ownProps.category_uuid;
    }
    if (filterValues?.offering) {
      filterObj.offering_uuid = filterValues.offering.uuid;
    }
    if (filterValues?.parent_offering) {
      filterObj.parent_offering_uuid = filterValues.parent_offering.uuid;
    }
    if (filterValues?.project) {
      filterObj.project_uuid = filterValues.project.uuid;
    }
    if (filterValues?.runtime_state) {
      filterObj.runtime_state = filterValues.runtime_state.value;
    }
    if (filterValues?.flavor_name) {
      filterObj.flavor_name = filterValues.flavor_name;
    }
    if (filterValues?.image_name) {
      filterObj.image_name = filterValues.image_name;
    }
    if (filterValues?.state) {
      filterObj.state = filterValues.state.map((option) => option.value);
      if (filterValues.include_terminated) {
        filterObj.state = [...filterObj.state, 'Terminated'];
      }
    } else {
      if (!filterValues?.include_terminated) {
        filterObj.state = NON_TERMINATED_STATES;
      }
    }
    if (filterValues?.organization) {
      filterObj.customer_uuid = filterValues.organization.uuid;
    }
    if (filterValues?.exclude_attached) {
      filterObj.is_attached = false;
    }
    if (filterValues?.paused) {
      filterObj.paused = true;
    }
    if (filterValues?.downscaled) {
      filterObj.downscaled = true;
    }
    if (filterValues?.restrict_member_access) {
      filterObj.restrict_member_access = true;
    }
    return filterObj;
  }, [filterValues, ownProps.category_uuid]);

  const { syncResourceFilters } =
    useOrganizationAndProjectAutocompletesForResources('category-resources');

  const props = useTable({
    table: `${CATEGORY_RESOURCES_TABLE_ID}-${ownProps.category_uuid}`,
    syncFiltersToURL: true,
    fetchData: createFetcher(marketplaceResourcesList),
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
  const isSpecified = (attribute) =>
    ownProps.columns.some((c) => c.attribute === attribute);

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
      render: ({ row }) => renderFieldOrDash(row.parent_offering_name),
      filter: 'parent_offering',
      id: 'parent_offering',
      keys: ['parent_offering_name'],
      optional: true,
    },
    {
      title: translate('Paused'),
      render: ({ row }) => <BooleanField value={row.paused} />,
      filter: 'paused',
      inlineFilter: () => true,
      id: 'paused',
      keys: ['paused'],
      optional: true,
    },
    {
      title: translate('Downscaled'),
      render: ({ row }) => <BooleanField value={row.downscaled} />,
      filter: 'downscaled',
      inlineFilter: () => true,
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
  ].filter((column) => !column.optional || !isSpecified(column.id));

  ownProps.columns.map((column: NestedColumn) => {
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
    orderField: 'project_name',
    inlineFilter: (row) => ({ name: row.project_name, uuid: row.project_uuid }),
    id: 'project',
    keys: ['project_name', 'project_uuid'],
    export: (row) => row.project_name,
  });
  columns.push(
    {
      title: translate('State'),
      render: ({ row }) => <ResourceStateField resource={row} pill outline />,
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
  );
  columns.push({
    title: translate('Termination date'),
    render: ({ row }) => <ResourceTerminationDateField row={row} format />,
    orderField: 'end_date',
    id: 'end_date',
    keys: ['end_date', 'resource_effective_end_date'],
    optional: !isFeatureVisible(MarketplaceFeatures.show_resource_end_date),
  });
  columns.push(SLUG_COLUMN);

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
      formId={CATEGORY_RESOURCES_ALL_FILTER_FORM_ID}
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
      filters={
        <AllResourcesFilter
          category_uuid={ownProps.category_uuid}
          columns={ownProps.columns}
        />
      }
      hasOptionalColumns
    />
  );
};
