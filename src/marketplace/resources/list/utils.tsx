import { Resource } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { BooleanField } from '@waldur/table/BooleanField';
import { SLUG_COLUMN } from '@waldur/table/slug';
import { Column } from '@waldur/table/types';
import { renderFieldOrDash } from '@waldur/table/utils';

import { ResourceNameField } from './ResourceNameField';
import { ResourceStateField } from './ResourceStateField';
import { getStates } from './ResourceStateFilter';
import { ResourceTerminationDateField } from './ResourceTerminationDateField';

export const resourcesListRequiredFields = (hasExpandableView = true) =>
  [
    'uuid',
    'name',
    hasExpandableView ? 'attributes' : null, // Expandable view
    'available_actions', // CreateLexisLinkAction
    'end_date', // EditResourceEndDateAction
    'offering_type', // Expandable view, Actions
    'offering_customer_uuid', // SubmitReportAction, EditResourceEndDateAction
    'backend_metadata', // Mass-actions
    'backend_id', // SetBackendIdAction
    'slug', // SetSlugAction
    'scope', // Expandable view, Actions
    'report', // ShowReportAction, SubmitReportAction
    'plan_uuid', // Expandable view, ChangeLimitsAction
    'marketplace_plan_uuid', // ChangeLimitsAction
    'is_limit_based', // Expandable view, ChangeLimitsAction
    hasExpandableView ? 'is_usage_based' : null, // Expandable view
    hasExpandableView ? 'limits' : null, // Expandable view
    hasExpandableView ? 'limit_usage' : null, // Expandable view
    hasExpandableView ? 'current_usages' : null, // Expandable view
    hasExpandableView ? 'parent_uuid' : null, // Expandable view
    hasExpandableView ? 'parent_name' : null, // Expandable view
    'customer_uuid', // SetBackendIdAction
    'description', // EditAction
    'resource_type', // EditAction, TerminateAction, UnlinkActionItem, Mass-actions
    'resource_uuid', // Mass-actions
  ].filter(Boolean);

export const getResourceAllListColumns = (
  hasCustomer = false,
  hasProject = false,
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
        export: (row) => row.category_title,
      },
      {
        title: translate('Offering'),
        render: ({ row }) => <>{row.offering_name}</>,
        filter: 'offering',
        inlineFilter: (row) => ({
          name: row.offering_name,
          uuid: row.offering_uuid,
        }),
        id: 'offering',
        keys: ['offering_name', 'offering_uuid'],
        export: (row) => row.offering_name,
      },
      {
        title: translate('Parent offering'),
        render: ({ row }) => <>{row.parent_offering_name || 'N/A'}</>,
        id: 'parent_offering',
        keys: ['parent_offering_name'],
        optional: true,
        filter: 'parent_offering',
      },
      {
        title: translate('Plan'),
        render: ({ row }) => <>{row.plan_name || 'N/A'}</>,
        id: 'plan',
        keys: ['plan_name'],
        optional: true,
      },
      ...(hasCustomer
        ? [
            {
              title: translate('Organization'),
              render: ({ row }) => <>{row.customer_name}</>,
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
        render: ({ row }) => <>{row.project_end_date || 'N/A'}</>,
        id: 'project_end_date',
        keys: ['project_end_date'],
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
        id: 'end_date',
        keys: ['end_date', 'project_end_date'],
        optional: !isFeatureVisible(MarketplaceFeatures.show_resource_end_date),
        export: (row) => row.end_date,
      },
      {
        title: translate('State'),
        render: ({ row }) => <ResourceStateField resource={row} outline pill />,
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
        render: ({ row }) => (
          <BooleanField value={row.restrict_member_access} />
        ),

        id: 'restrict_member_access',
        keys: ['restrict_member_access'],
        optional: true,
      },

      SLUG_COLUMN,
    ] as Column<Resource>[]
  ).filter(Boolean);
