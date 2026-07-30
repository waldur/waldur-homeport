import { MarketplaceResourcesListData, Resource } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { BooleanField } from '@/table/BooleanField';
import { SLUG_COLUMN } from '@/table/slug';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

import { NON_TERMINATED_STATES } from './constants';
import { ResourceNameField } from './ResourceNameField';
import { ResourceStateField } from './ResourceStateField';
import { getStates } from './ResourceStateFilter';
import { ResourceTerminationDateField } from './ResourceTerminationDateField';

export const buildResourcesAllFilter = (
  filters: any,
  baseFilter?: any,
): MarketplaceResourcesListData['query'] => {
  const result: MarketplaceResourcesListData['query'] = { ...baseFilter };
  if (filters?.offering) {
    result.offering_uuid = filters.offering.uuid;
  }
  if (filters?.parent_offering) {
    result.parent_offering_uuid = filters.parent_offering.uuid;
  }
  if (filters?.category) {
    result.category_uuid = filters.category.uuid;
  }
  if (filters?.project) {
    result.project_uuid = filters.project.uuid;
  }
  if (filters?.runtime_state) {
    result.runtime_state = filters.runtime_state.value;
  }
  if (filters?.state && Array.isArray(filters.state)) {
    result.state = filters.state.map((option) => option.value) as any;
    if (filters?.include_terminated) {
      result.state = [...result.state, 'Terminated'];
    }
  } else {
    if (!filters?.include_terminated) {
      result.state = NON_TERMINATED_STATES;
    }
  }
  if (filters?.organization) {
    result.customer_uuid = filters.organization.uuid;
  }
  if (filters?.paused) {
    result.paused = true;
  }
  if (filters?.downscaled) {
    result.downscaled = true;
  }
  if (filters?.restrict_member_access) {
    result.restrict_member_access = true;
  }
  return result;
};

export const resourcesListRequiredFields = (hasExpandableView = true) =>
  [
    'uuid',
    'name',
    hasExpandableView ? 'attributes' : null, // Expandable view
    'available_actions', // CreateLexisLinkAction
    'end_date', // EditResourceEndDateAction
    'offering_type', // Expandable view, Actions
    'offering_state', // Actions
    'provider_uuid', // SubmitReportAction, EditResourceEndDateAction
    'backend_metadata', // Mass-actions
    'backend_id', // SetBackendIdAction
    'effective_id', // BackendIdField in ExpandableResourceSummary
    'offering_plugin_options', // BackendIdField in ExpandableResourceSummary
    hasExpandableView ? 'options' : null, // Resource options in ExpandableResourceSummary
    'slug', // SetSlugAction
    'scope', // Expandable view, Actions
    'report', // ShowReportAction, SubmitReportAction
    'plan_uuid', // Expandable view, ChangeLimitsAction
    'marketplace_plan_uuid', // ChangeLimitsAction
    'is_limit_based', // Expandable view, ChangeLimitsAction
    'is_usage_based', // Expandable view, ShowUsageAction, ReportUsageAction
    hasExpandableView ? 'limits' : null, // Expandable view
    hasExpandableView ? 'limit_usage' : null, // Expandable view
    hasExpandableView ? 'current_usages' : null, // Expandable view
    hasExpandableView ? 'parent_uuid' : null, // Expandable view
    hasExpandableView ? 'parent_name' : null, // Expandable view
    'customer_uuid', // SetBackendIdAction
    'customer_name', // TerminateAction confirmation dialog
    'project_name', // TerminateAction confirmation dialog
    'description', // EditAction
    'resource_type', // EditAction, TerminateAction, UnlinkActionItem, Mass-actions
    'resource_uuid', // Mass-actions
    'paused', // ResourceFlags inline badge
    'downscaled', // ResourceFlags inline badge
    'restrict_member_access', // ResourceFlags inline badge
    'project_is_in_grace_period', // ResourceFlags inline badge
    'project_effective_end_date', // ResourceFlags inline badge (expired/conflict)
    'resource_effective_end_date', // ResourceFlags in-grace/conflict + Termination date column

    'project_uuid', // rowActions permissions check
    'state', // ResourceFlags overdue badge skips terminating/terminated
  ].filter(Boolean);

export const getResourceAllListColumns = (
  hasCustomer = false,
  hasProject = false,
  // On a list already scoped to a single offering, category and offering hold
  // the same value in every row. They stay available in the column picker, but
  // showing them by default only costs horizontal space.
  { isOfferingScoped = false }: { isOfferingScoped?: boolean } = {},
) =>
  (
    [
      {
        title: translate('Name'),
        render: ResourceNameField,
        orderField: 'name',
        id: 'name',
        keys: ['name'],
        export: (row) => row.name || row.offering_name, // render as ResourceNameField label
      },
      {
        title: translate('UUID'),
        render: ({ row }) => <>{row.uuid}</>,
        id: 'uuid',
        keys: ['uuid'],
        optional: true,
      },
      {
        title: translate('Backend ID'),
        render: ({ row }) => renderFieldOrDash(row.backend_id),
        orderField: 'backend_id',
        id: 'backend_id',
        keys: ['backend_id'],
        optional: true,
      },
      {
        title: translate('Category'),
        render: ({ row }) => <>{row.category_title}</>,
        filter: 'category',
        inlineFilter: (row) => ({
          title: row.category_title,
          uuid: row.category_uuid,
        }),
        id: 'category',
        keys: ['category_title', 'category_uuid'],
        optional: isOfferingScoped,
        export: (row) => row.category_title,
      },
      {
        title: translate('Offering'),
        render: ({ row }) => <>{row.offering_name}</>,
        orderField: 'offering_name',
        filter: 'offering',
        inlineFilter: (row) => ({
          name: row.offering_name,
          uuid: row.offering_uuid,
        }),
        id: 'offering',
        keys: ['offering_name', 'offering_uuid'],
        optional: isOfferingScoped,
        export: (row) => row.offering_name,
      },
      {
        title: translate('Parent offering'),
        render: ({ row }) => <>{renderFieldOrDash(row.parent_offering_name)}</>,
        id: 'parent_offering',
        keys: ['parent_offering_name'],
        optional: true,
        filter: 'parent_offering',
      },
      {
        title: translate('Plan'),
        render: ({ row }) => <>{renderFieldOrDash(row.plan_name)}</>,
        orderField: 'plan_name',
        filter: 'plan',
        inlineFilter: (row) => ({
          name: row.plan_name,
          uuid: row.plan_uuid,
        }),
        id: 'plan',
        keys: ['plan_name', 'plan_uuid'],
        optional: true,
      },
      ...(hasCustomer
        ? [
            {
              title: translate('Organization'),
              render: ({ row }) => <>{row.customer_name}</>,
              orderField: 'customer_name',
              filter: 'organization',
              inlineFilter: (row) => ({
                name: row.customer_name,
                uuid: row.customer_uuid,
              }),
              id: 'organization',
              keys: ['customer_name'],
              export: (row) => row.customer_name,
            },
          ]
        : []),
      ...(hasProject
        ? [
            {
              title: translate('Project'),
              render: ({ row }) => <>{row.project_name}</>,
              filter: 'project',
              orderField: 'project_name',
              inlineFilter: (row) => ({
                name: row.project_name,
                uuid: row.project_uuid,
              }),
              id: 'project',
              keys: ['project_name', 'project_uuid'],
              export: (row) => row.project_name,
            },
          ]
        : []),
      {
        title: translate('Project end date'),
        render: ({ row }) => (
          <>
            {renderFieldOrDash(row.project_end_date)}
            {row.project_effective_end_date &&
              row.project_end_date &&
              row.project_effective_end_date !== row.project_end_date && (
                <span className="text-muted ms-1">
                  (+
                  {Math.round(
                    (new Date(row.project_effective_end_date).getTime() -
                      new Date(row.project_end_date).getTime()) /
                      86400000,
                  )}
                  d)
                </span>
              )}
          </>
        ),
        id: 'project_end_date',
        keys: ['project_end_date', 'project_effective_end_date'],
        optional: true,
      },
      {
        title: translate('Created at'),
        render: ({ row }) => <>{formatDateTime(row.created)}</>,
        orderField: 'created',
        id: 'created',
        keys: ['created'],
        export: (row) => formatDateTime(row.created),
      },
      {
        title: translate('Termination date'),
        render: ResourceTerminationDateField,
        orderField: 'end_date',
        id: 'end_date',
        keys: ['end_date', 'resource_effective_end_date'],
        optional: !isFeatureVisible(MarketplaceFeatures.show_resource_end_date),
        export: (row) => row.resource_effective_end_date,
      },
      {
        title: translate('State'),
        render: ({ row }) => <ResourceStateField resource={row} pill outline />,
        filter: 'state',
        orderField: 'state',
        inlineFilter: (row) =>
          getStates().filter((op) => op.value === row.state),
        id: 'state',
        keys: ['state', 'backend_metadata'],
        export: (row) =>
          row.backend_metadata?.runtime_state ||
          row.backend_metadata?.state ||
          row.state,
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
        render: ({ row }) => (
          <BooleanField value={row.restrict_member_access} />
        ),
        filter: 'restrict_member_access',
        inlineFilter: () => true,
        id: 'restrict_member_access',
        keys: ['restrict_member_access'],
        optional: true,
      },

      SLUG_COLUMN,
    ] as Column<Resource>[]
  ).filter(Boolean);
