import { FC, useEffect } from 'react';
import { marketplaceResourcesList, Resource } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { getAttribution } from '@/marketplace/resources/details/ResourceFlags';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CostPolicyType } from './types';

/** Each action a cost policy takes on a resource: the flag it sets, the
 * offering option that has to allow it, and its name. The same pairs decide
 * the policy's `affected_resources_count` on the server. */
const ACTION_FLAGS = [
  {
    action: 'request_pausing',
    field: 'paused',
    support: 'supports_pausing',
    label: () => translate('Paused'),
  },
  {
    action: 'request_downscaling',
    field: 'downscaled',
    support: 'supports_downscaling',
    label: () => translate('Downscaled'),
  },
  {
    action: 'restrict_members',
    field: 'restrict_member_access',
    support: 'service_provider_can_create_offering_user',
    label: () => translate('Access restricted'),
  },
] as const;

const TERMINAL_STATES = ['Terminating', 'Terminated'];

interface AffectedRow {
  resource: Resource;
  field: (typeof ACTION_FLAGS)[number]['field'];
  label: string;
}

const fetchAffected = async (policy, type: CostPolicyType) => {
  const actions = new Set((policy.actions || '').split(','));
  const flags = ACTION_FLAGS.filter((flag) => actions.has(flag.action));
  const scope =
    type === 'project'
      ? { project_uuid: policy.scope_uuid }
      : { customer_uuid: policy.scope_uuid };
  const lists = await Promise.all(
    flags.map((flag) =>
      marketplaceResourcesList({
        query: { ...scope, [flag.field]: true, page_size: 200 } as any,
      }).then((response) =>
        response.data
          .filter(
            (resource) =>
              !TERMINAL_STATES.includes(resource.state as string) &&
              (resource.offering_plugin_options as any)?.[flag.support] ===
                true &&
              // A resource-scoped policy acts on its own resource only.
              (!policy.resource_name || resource.name === policy.resource_name),
          )
          .map((resource) => ({
            resource,
            field: flag.field,
            label: flag.label(),
          })),
      ),
    ),
  );
  const rows: AffectedRow[] = lists.flat();
  return { rows, resultCount: rows.length };
};

/** The resources the policy's actions are in effect on: what changed on each,
 * since when, and whether this policy or something else set it. */
export const CostPolicyAffectedResources: FC<{
  policy;
  type: CostPolicyType;
}> = ({ policy, type }) => {
  // Fetched once per policy state and paged here: a policy can cover many
  // resources, and the dialog should not grow with them.
  const tableProps = useTable({
    table: `cost-policy-affected-resources-${policy.uuid}`,
    fetchData: async (request) =>
      createClientPaginatedFetcher((await fetchAffected(policy, type)).rows)(
        request,
      ),
  });
  useEffect(() => {
    tableProps.fetch();
  }, [policy.uuid, policy.has_fired]);

  return (
    <Table<AffectedRow>
      {...tableProps}
      columns={[
        {
          title: translate('Resource'),
          render: ({ row }) => (
            <Link
              state="marketplace-resource-details"
              params={{ resource_uuid: row.resource.uuid }}
              label={row.resource.name}
            />
          ),
        },
        type === 'organization' && {
          title: translate('Project'),
          render: ({ row }) => (
            <>{renderFieldOrDash(row.resource.project_name)}</>
          ),
        },
        {
          title: translate('Offering'),
          render: ({ row }) => (
            <>{renderFieldOrDash(row.resource.offering_name)}</>
          ),
        },
        {
          title: translate('Change'),
          render: ({ row }) => (
            <Badge variant="danger" size="sm" shape="pill" tone="outline">
              {row.label}
            </Badge>
          ),
        },
        {
          title: translate('Since'),
          render: ({ row }) => {
            const attribution = getAttribution(row.resource, row.field);
            return (
              <>
                {renderFieldOrDash(
                  attribution?.timestamp
                    ? formatDateTime(attribution.timestamp)
                    : null,
                )}
              </>
            );
          },
        },
        {
          title: translate('Set by'),
          render: ({ row }) => {
            const attribution = getAttribution(row.resource, row.field);
            return (
              <>
                {!attribution
                  ? translate('Manually or a usage limit')
                  : attribution.policy_uuid === policy.uuid
                    ? translate('This policy')
                    : translate('Another policy')}
              </>
            );
          },
        },
      ].filter(Boolean)}
      verboseName={translate('affected resources')}
      hideTitle
      hasActionBar={false}
      initialPageSize={5}
      minHeight="auto"
      cardBordered={false}
      bodyClassName="p-0"
      placeholderHasRetry={false}
    />
  );
};
