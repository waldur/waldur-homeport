import { useEffect, useMemo, useRef } from 'react';
import { Offering, Resource } from 'waldur-js-client';

import { AlertItem, Badge } from 'waldur-ui';

import Avatar from '@/core/Avatar';
import { CreateModalButton } from '@/core/buttons';
import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import {
  getResourceModels,
  isAllModels,
} from '@/marketplace/common/modelSelection';
import { PermissionEnum } from '@/permissions/enums';
import { hasConsumerPermission } from '@/permissions/hasPermission';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { Column, TableProps } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { ApiKeyActionsDropdown } from './ApiKeyActions';
import { ApiKeyExpandableRow } from './ApiKeyExpandableRow';
import { ApiKeyUsageSummary } from './ApiKeyUsageMeter';
import { getHeadlineUsage, ResourceSpendingLimits } from './keyLimits';
import { getResourceKeyComponents } from './keySpendingLimits';
import {
  getKeyStateVariant,
  getResourcePause,
  getResourcePauseDetails,
  getStateLabel,
  getStateTooltip,
  ResourcePause,
} from './state';
import { ApiKeyRow, KeyComponent } from './types';
import { TRANSITIONAL } from './useResourceApiKeys';

const RequestApiKeyDialog = lazyComponent(() =>
  import('./RequestApiKeyDialog').then((module) => ({
    default: module.RequestApiKeyDialog,
  })),
);

// Limits, usage and models exist only under key management; without it the API
// returns them as null, so their columns would only ever show dashes. An
// assignee set while it was on still decides who may reveal the key, so its
// column stays for as long as any key has one.
const getColumns = (
  components: KeyComponent[],
  models: string[] | null,
  resourceLimits: ResourceSpendingLimits,
  keyManagement: boolean,
  anyAssigned: boolean,
  pause: ResourcePause | null,
): Column<ApiKeyRow>[] => [
  {
    title: translate('Key ID'),
    render: ({ row }) =>
      row.client_id ? <code>{row.client_id}</code> : DASH_ESCAPE_CODE,
  },
  ...(keyManagement
    ? getManagedColumns(components, models, resourceLimits)
    : anyAssigned
      ? [getAssigneeColumn()]
      : []),
  {
    title: translate('State'),
    render: ({ row }) => {
      const { variant, active } = getKeyStateVariant(row, pause);
      return (
        <StateIndicator
          label={getStateLabel(row, pause)}
          variant={variant}
          active={active}
          tooltip={getStateTooltip(row, pause, components)}
          shape="pill"
          tone="outline"
        />
      );
    },
  },
  {
    // The age of the value in use: set by its creation or latest rotation, not
    // moved by a pause or an edit.
    title: translate('Issued'),
    render: ({ row }) =>
      renderFieldOrDash(row.issued_at && formatDateTime(row.issued_at)),
  },
];

const getAssigneeColumn = (): Column<ApiKeyRow> => ({
  title: translate('Assignee'),
  render: ({ row }) =>
    row.user_full_name ? (
      <span className="flex items-center gap-x-2">
        <Avatar name={row.user_full_name} size={32} circle />
        {row.user_full_name}
      </span>
    ) : (
      DASH_ESCAPE_CODE
    ),
});

const getManagedColumns = (
  components: KeyComponent[],
  models: string[] | null,
  resourceLimits: ResourceSpendingLimits,
): Column<ApiKeyRow>[] => [
  getAssigneeColumn(),
  ...(components.length
    ? [
        {
          title: translate('Limits & usage'),
          render: ({ row }: { row: ApiKeyRow }) => (
            <ApiKeyUsageSummary
              reading={getHeadlineUsage(row, components, resourceLimits)}
            />
          ),
        },
      ]
    : []),
  ...(models
    ? [
        {
          title: translate('Models'),
          render: ({ row }: { row: ApiKeyRow }) => {
            // All models is every model the resource allows, which may be none.
            if (isAllModels(row.allowed_models) && models.length) {
              return translate('All models');
            }
            // Models no longer offered, or no longer allowed by the resource,
            // are dropped rather than shown stale; a key left with none of
            // them can call nothing.
            const allowed = (row.allowed_models ?? []).filter((model) =>
              models.includes(model),
            );
            return allowed.length ? (
              // Table cells have no vertical padding of their own, so wrapped
              // chips need it to stay clear of the row borders.
              <span className="flex flex-wrap gap-3 py-3">
                {allowed.map((model) => (
                  <Badge
                    key={model}
                    variant="neutral"
                    shape="pill"
                    tone="outline"
                  >
                    {model}
                  </Badge>
                ))}
              </span>
            ) : (
              translate('No models')
            );
          },
        },
      ]
    : []),
];

interface ResourceApiKeysCardProps extends TableProps<ApiKeyRow> {
  resource: Resource;
  offering?: Pick<
    Offering,
    'components' | 'plans' | 'plugin_options' | 'resource_options'
  >;
}

export const ResourceApiKeysCard = ({
  resource,
  offering,
  ...tableProps
}: ResourceApiKeysCardProps) => {
  const user = useUser();
  // The backend checks the permission on the project and its organization
  // only: a role on the organization as a service provider acts for the
  // provider and does not count.
  const canManage = hasConsumerPermission(user, {
    permission: PermissionEnum.MANAGE_RESOURCE_CONSUMER_API_KEY,
    projectId: resource.project_uuid,
    customerId: resource.customer_uuid,
  });
  const components = useMemo<KeyComponent[]>(
    () => getResourceKeyComponents(offering, resource.plan_uuid),
    [offering, resource.plan_uuid],
  );
  // The resource's spending limits cap its keys, period by period.
  const resourceLimits = resource.spending_limits;
  // The offering's choices, narrowed by the resource's own selection.
  const models = useMemo(
    () => getResourceModels(offering, resource),
    [offering, resource],
  );
  const keyManagement = Boolean(
    offering?.plugin_options?.enable_api_key_provisioning,
  );
  const pause = getResourcePause(resource);

  // useTable has no built-in polling; refresh while any key is mid-operation.
  const rows = (tableProps.rows ?? []) as ApiKeyRow[];
  const syncing = rows.some(
    (key) => key.state && TRANSITIONAL.includes(key.state),
  );
  const fetchRef = useRef(tableProps.fetch);
  fetchRef.current = tableProps.fetch;
  useEffect(() => {
    if (!syncing) return;
    const timer = setInterval(() => fetchRef.current(), 5000);
    return () => clearInterval(timer);
  }, [syncing]);

  return (
    <>
      {pause && (
        <AlertItem
          type="floating"
          variant="warning"
          className="mb-4"
          title={translate(
            'This resource is paused, so none of its keys is served.',
          )}
          body={getResourcePauseDetails(pause, resource)}
        />
      )}
      <Table<ApiKeyRow>
        title={translate('API keys')}
        verboseName={translate('API keys')}
        // A resource under key management starts with no keys.
        emptyMessage={
          keyManagement
            ? translate(
                'API keys are requested here, one at a time, by people who can manage the resource.',
              )
            : undefined
        }
        cardBordered
        columns={getColumns(
          components,
          models,
          resourceLimits,
          keyManagement,
          rows.some((key) => key.user_uuid),
          pause,
        )}
        tableActions={
          canManage && keyManagement ? (
            <CreateModalButton
              title={translate('Request key')}
              dialog={RequestApiKeyDialog}
              size="md"
              resolve={{
                resource,
                components,
                models,
                refetch: tableProps.fetch,
              }}
            />
          ) : undefined
        }
        // The expanded row is the per-component usage, which only key
        // management reports; without it there is nothing to expand, so the
        // header's expand-all toggle goes too.
        expandableRow={
          keyManagement && components.length
            ? ({ row }) => (
                <ApiKeyExpandableRow
                  row={row}
                  components={components}
                  resourceLimits={resourceLimits}
                />
              )
            : undefined
        }
        rowActions={({ row }) => (
          <ApiKeyActionsDropdown
            row={row}
            resource={resource}
            components={components}
            models={models}
            canManage={canManage}
            keyManagement={keyManagement}
            refetch={tableProps.fetch}
          />
        )}
        {...tableProps}
      />
    </>
  );
};
