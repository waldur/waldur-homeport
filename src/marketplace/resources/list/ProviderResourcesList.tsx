import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import {
  marketplaceProviderResourcesList,
  MarketplaceProviderResourcesListData,
  Project,
  Resource,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { BooleanBadge } from '@/core/BooleanBadge';
import { formatDateTime } from '@/core/dateUtils';
import { getInitialValues, syncFiltersToURL } from '@/core/filters';
import { lazyComponent } from '@/core/lazyComponent';
import { BackendIdTip } from '@/core/Tooltip';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { Option } from '@/marketplace/common/registry';
import { ResourceFlags } from '@/marketplace/resources/details/ResourceFlags';
import { ExpandableResourceSummary } from '@/marketplace/resources/list/ExpandableResourceSummary';
import { ResourceMultiSelectAction } from '@/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { Category } from '@/marketplace/types';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

import {
  NON_TERMINATED_STATES,
  PROVIDER_RESOURCES_LIST_FILTER_FORM_ID,
  TABLE_PUBLIC_RESOURCE,
} from './constants';
import { EndDateTooltip } from './EndDateTooltip';
import { ProviderResourceActions } from './ProviderResourceActions';
import { ProviderResourcesFilter } from './ProviderResourcesFilter';
import { PublicResourcesLimits } from './PublicResourcesLimits';
import { ResourceStateField } from './ResourceStateField';
import { getStates } from './ResourceStateFilter';

interface ResourceFilter {
  state?: Option[];
  organization?: Customer;
  project?: Project;
  category?: Category;
  offering?: Offering;
  parent_offering?: Offering;
  include_terminated?: boolean;
  paused?: boolean;
  downscaled?: boolean;
  restrict_member_access?: boolean;
}

const ResourceDetailsDialog = lazyComponent(() =>
  import('../details/popup/ResourceDetailsDialog').then((module) => ({
    default: module.ResourceDetailsDialog,
  })),
);

const ResourceField = ({ row }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(ResourceDetailsDialog, {
      resolve: { resource: row },
    });
  };
  return (
    <div className="d-flex align-items-center gap-1">
      <ActionButton
        variant="flush"
        className="text-anchor fw-normal"
        action={callback}
        title={row.name || row.offering_name}
      />
      <BackendIdTip backendId={row.backend_id} />
      <EndDateTooltip end_date={row.end_date} />
      <ResourceFlags resource={row} />
    </div>
  );
};

const ProviderExpandableResourceSummary: FunctionComponent<{
  row: Resource;
}> = (props) => <ExpandableResourceSummary {...props} context="provider" />;

const TableComponent: FunctionComponent<any> = (props) => {
  React.useEffect(() => {
    props.resetPagination();
  }, [props.filter]);
  const columns: Column<Resource>[] = [
    {
      title: translate('Name'),
      render: ResourceField,
      copyField: (row) => row.name || row.offering_name,
      orderField: 'name',
      id: 'name',
      export: 'name',
      keys: ['name', 'backend_id', 'uuid'],
    },
    {
      title: translate('Resource UUID'),
      id: 'uuid',
      keys: ['uuid'],
      render: ({ row }) => <>{row.uuid}</>,
      export: 'uuid',
      optional: true,
    },
    {
      title: translate('Offering'),
      render: ({ row }) => <>{row.offering_name}</>,
      export: 'offering_name',
      keys: ['offering_name'],
      id: 'offering_name',
    },
    {
      title: translate('Client organization'),
      render: ({ row }) => <>{row.customer_name}</>,
      filter: 'organization',
      inlineFilter: (row) => ({
        name: row.customer_name,
        uuid: row.customer_uuid,
      }),
      keys: ['customer_name'],
      export: 'customer_name',
      id: 'customer_name',
    },
    {
      title: translate('Project'),
      render: ({ row }) => <>{row.project_name}</>,
      keys: ['project_name'],
      filter: 'project_name',
      orderField: 'project_name',
      inlineFilter: (row) => ({
        name: row.project_name,
        uuid: row.project_uuid,
      }),
      export: 'project_name',
      id: 'project_name',
    },
    {
      title: translate('Category'),
      render: ({ row }) => <>{row.category_title}</>,
      filter: 'category',
      inlineFilter: (row) => ({
        title: row.category_title,
        uuid: row.category_uuid,
      }),
      keys: ['category_title', 'category_uuid'],
      export: 'category_title',
      id: 'category_title',
    },
    {
      title: translate('Plan'),
      render: ({ row }) => <>{renderFieldOrDash(row.plan_name)}</>,
      export: 'plan_name',
      keys: ['plan_name'],
      optional: true,
      id: 'plan',
    },
    {
      title: translate('Limits'),
      render: PublicResourcesLimits,
      export: (row) => JSON.stringify(row.limits),
      keys: ['limits'],
      exportKeys: ['limits'],
      optional: true,
      id: 'limits',
    },
    {
      title: translate('Effective ID'),
      render: ({ row }) => <>{renderFieldOrDash(row.effective_id)}</>,
      export: 'effective_id',
      optional: true,
      keys: ['effective_id'],
      id: 'effective_id',
    },
    {
      title: translate('Backend ID'),
      render: ({ row }) => <>{renderFieldOrDash(row.backend_id)}</>,
      export: 'backend_id',
      optional: true,
      keys: ['backend_id'],
      id: 'backend_id',
    },
    {
      title: translate('Requested downscaling'),
      render: ({ row }) => <BooleanBadge value={row.downscaled} />,
      filter: 'downscaled',
      inlineFilter: () => true,
      export: 'downscaled',
      keys: ['downscaled'],
      exportKeys: ['downscaled'],
      optional: true,
      id: 'downscaled',
    },
    {
      title: translate('Restrict member access'),
      render: ({ row }) => <BooleanBadge value={row.restrict_member_access} />,
      filter: 'restrict_member_access',
      inlineFilter: () => true,
      export: 'restrict_member_access',
      keys: ['restrict_member_access'],
      exportKeys: ['restrict_member_access'],
      optional: true,
      id: 'restrict_member_access',
    },
    {
      title: translate('Requested pausing'),
      render: ({ row }) => <BooleanBadge value={row.paused} />,
      filter: 'paused',
      inlineFilter: () => true,
      export: 'paused',
      keys: ['paused'],
      exportKeys: ['paused'],
      optional: true,
      id: 'paused',
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
      export: (row) => formatDateTime(row.created),
      exportKeys: ['created'],
      id: 'created',
      keys: ['created'],
    },
    {
      title: translate('Termination date'),
      render: ({ row }) =>
        row.end_date ? formatDateTime(row.end_date) : 'N/A',
      orderField: 'end_date',
      id: 'end_date',
      keys: ['end_date'],
      optional: !isFeatureVisible(MarketplaceFeatures.show_resource_end_date),
      export: (row) => row.end_date,
      exportKeys: ['end_date'],
    },
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
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Resources')}
      title={translate('Resources')}
      enableExport={true}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      hasOptionalColumns
      showPageSizeSelector={true}
      expandableRow={ProviderExpandableResourceSummary}
      rowActions={({ row }) => (
        <ProviderResourceActions resource={row} refetch={props.fetch} />
      )}
      enableMultiSelect={true}
      multiSelectActions={ResourceMultiSelectAction}
    />
  );
};

const TableOptions = {
  table: TABLE_PUBLIC_RESOURCE,
  fetchData: createFetcher(marketplaceProviderResourcesList),
  queryField: 'query',
};

const mandatoryFields: MarketplaceProviderResourcesListData['query']['field'] =
  [
    'uuid', // Almost all actions
    'name', // Almost all actions
    'url', // CreateRobotAccountAction
    'customer_uuid', // ReportUsageAction, SetBackendIdAction
    'customer_name', // ShowUsageAction, ReportUsageAction
    'project_uuid', // CreateRobotAccountAction
    'project_name', // ShowUsageAction, ReportUsageAction
    'offering_uuid', // ShowUsageAction, ReportUsageAction
    'provider_uuid', // CreateRobotAccountAction
    'offering_plugin_options', // CreateRobotAccountAction
    'backend_id', // ShowUsageAction, ReportUsageAction, SetBackendIdAction
    'is_usage_based', // Expandable view, ShowUsageAction, ReportUsageAction
    'is_limit_based', // Expandable view, ShowUsageAction, ReportUsageAction
    'limits', // Expandable view
    'limit_usage', // Expandable view
    'current_usages', // Expandable view
    'state', // Almost all actions
    'slug', // SetSlugAction
    'end_date', // EditResourceEndDateByProviderAction
    'resource_type', // TerminateAction
    'paused', // ResourceFlags inline badge
    'downscaled', // ResourceFlags inline badge
    'restrict_member_access', // ResourceFlags inline badge
  ];

const ProviderResourcesListTable: FunctionComponent = () => {
  const customer = useCustomer();
  const { values } = useFormState();
  const filterValues: ResourceFilter = values;

  useEffect(() => {
    if (filterValues) {
      syncFiltersToURL(filterValues);
    }
  }, [filterValues]);

  const filter = useMemo(() => {
    const filterObj: MarketplaceProviderResourcesListData['query'] = {};

    filterObj.offering_billable = true;

    if (customer) {
      filterObj.provider_uuid = customer.uuid;
    }
    if (filterValues?.offering?.uuid) {
      filterObj.offering_uuid = [filterValues.offering.uuid];
    }
    if (filterValues?.parent_offering) {
      filterObj.parent_offering_uuid = filterValues.parent_offering.uuid;
    }
    if (filterValues?.state) {
      filterObj.state = filterValues.state.map((option) => option.value as any);
      if (filterValues?.include_terminated) {
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
    if (filterValues?.project) {
      filterObj.project_uuid = filterValues.project.uuid;
    }
    if (filterValues?.category) {
      filterObj.category_uuid = filterValues.category.uuid;
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
  }, [customer, filterValues]);

  const tableProps = useTable({
    ...TableOptions,
    filter,
    mandatoryFields,
  });

  return (
    <TableComponent
      {...tableProps}
      formId={PROVIDER_RESOURCES_LIST_FILTER_FORM_ID}
      filters={<ProviderResourcesFilter />}
    />
  );
};

export const ProviderResourcesList: React.ComponentType<any> = () => {
  const initialValues = useMemo(
    () =>
      getInitialValues({
        state: getStates().filter((state) => state.value !== 'Terminated'),
      }),
    [],
  );

  return (
    <Form
      onSubmit={() => {}}
      subscription={{ values: true }}
      initialValues={initialValues}
    >
      {() => <ProviderResourcesListTable />}
    </Form>
  );
};
