import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo } from 'react';
import {
  marketplaceProviderOfferingsList,
  marketplaceResourceApiKeysList,
  MarketplaceResourceApiKeysListData,
  ProviderOfferingDetails,
  ResourceApiKeyStatus,
  ServiceProvider,
} from 'waldur-js-client';

import { Avatar, Code } from 'waldur-ui';

import { UI_STALE_TIME } from '@/core/constants';
import { defaultCurrency } from '@/core/formatCurrency';
import { Link } from '@/core/Link';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { UsageMeter } from '@/marketplace/resources/details/api-keys/ApiKeyUsageMeter';
import {
  getComponentUsage,
  ResourceSpendingLimits,
} from '@/marketplace/resources/details/api-keys/keyLimits';
import { getResourceKeyComponents } from '@/marketplace/resources/details/api-keys/keySpendingLimits';
import {
  getKeyStateVariant,
  getStateLabel,
  getStateTooltip,
} from '@/marketplace/resources/details/api-keys/state';
import { KeyComponent } from '@/marketplace/resources/details/api-keys/types';
import { getOfferingComponentsKey } from '@/project/dashboard/offeringComponentsKey';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import {
  PROVIDER_API_KEYS_FILTER_FORM_ID,
  ProviderApiKeysFilter,
  selectProviderApiKeysFilter,
} from './ProviderApiKeysFilter';
import { ProviderApiKeysSummary } from './ProviderApiKeysSummary';

export const PROVIDER_API_KEYS_TABLE = 'provider-api-keys';

type KeyQuery = NonNullable<MarketplaceResourceApiKeysListData['query']>;

type KeyOffering = Pick<
  ProviderOfferingDetails,
  'uuid' | 'components' | 'plans' | 'plugin_options'
>;

const NO_OFFERINGS: KeyOffering[] = [];
const NO_COMPONENTS: KeyComponent[] = [];

/**
 * The components a key has used or is limited on this month, against the
 * limit in force on it: its own, or the resource's, which caps every key of
 * the resource. The components come from the resource's plan, as on the
 * resource's API keys tab, in the offering's order; a component the offering
 * no longer has, or any while the offerings load, reads as its type.
 */
export const getKeyUsages = (
  row: ResourceApiKeyStatus,
  components: KeyComponent[] = NO_COMPONENTS,
  resourceLimits?: ResourceSpendingLimits,
) => {
  const known = new Set(components.map((component) => component.type));
  const unknown = [
    ...new Set([
      ...Object.keys(row.current_usages ?? {}),
      ...Object.keys(row.spending_limits ?? {}),
      ...Object.keys(resourceLimits ?? {}),
    ]),
  ]
    .filter((type) => !known.has(type))
    .sort()
    .map((type): KeyComponent => ({ type }));
  return [...components, ...unknown]
    .map((component) => getComponentUsage(row, component, resourceLimits))
    .filter((reading) => reading.used !== undefined || reading.limit);
};

/** The key components of each row's resource, by the row's offering and plan. */
const getRowComponents = (
  row: ResourceApiKeyStatus,
  offerings: Map<string, KeyOffering>,
) => {
  const offering = offerings.get(row.offering_uuid);
  return offering
    ? getResourceKeyComponents(offering, row.resource_plan_uuid)
    : NO_COMPONENTS;
};

const KeyUsage: FC<{
  row: ResourceApiKeyStatus;
  offerings: Map<string, KeyOffering>;
}> = ({ row, offerings }) => {
  const readings = getKeyUsages(
    row,
    getRowComponents(row, offerings),
    row.resource_spending_limits,
  );
  return readings.length ? (
    <div className="flex min-w-[200px] flex-col gap-y-2 py-2">
      {readings.map((reading) => (
        <UsageMeter key={reading.component.type} reading={reading} />
      ))}
    </div>
  ) : (
    <>{DASH_ESCAPE_CODE}</>
  );
};

const getColumns = (
  providerCustomerUuid: string,
  offerings: Map<string, KeyOffering>,
) => {
  const columns: Column<ResourceApiKeyStatus>[] = [
    {
      title: translate('Key ID'),
      id: 'client_id',
      keys: ['client_id'],
      render: ({ row }) =>
        row.client_id ? <Code>{row.client_id}</Code> : DASH_ESCAPE_CODE,
      export: 'client_id',
    },
    {
      // Opens the resource on its API keys tab, where the key's actions live.
      title: translate('Resource'),
      id: 'resource_name',
      keys: ['resource_name', 'resource_uuid'],
      render: ({ row }) => (
        <Link
          state="marketplace-provider-resource-details"
          params={{
            uuid: providerCustomerUuid,
            resource_uuid: row.resource_uuid,
            tab: 'api-keys',
          }}
          label={row.resource_name}
        />
      ),
      export: 'resource_name',
    },
    {
      title: translate('Offering'),
      id: 'offering_name',
      keys: ['offering_name'],
      render: ({ row }) => <>{row.offering_name}</>,
      filter: 'offering',
      inlineFilter: (row) => ({
        name: row.offering_name,
        uuid: row.offering_uuid,
      }),
      export: 'offering_name',
    },
    {
      title: translate('Client organization'),
      id: 'customer_name',
      keys: ['customer_name'],
      render: ({ row }) => <>{row.customer_name}</>,
      filter: 'customer',
      inlineFilter: (row) => ({
        name: row.customer_name,
        uuid: row.customer_uuid,
      }),
      export: 'customer_name',
    },
    {
      title: translate('Project'),
      id: 'project_name',
      keys: ['project_name'],
      render: ({ row }) => <>{row.project_name}</>,
      filter: 'project',
      inlineFilter: (row) => ({
        name: row.project_name,
        uuid: row.project_uuid,
      }),
      export: 'project_name',
    },
    {
      title: translate('Assignee'),
      id: 'user_full_name',
      keys: ['user_full_name', 'user_uuid'],
      filter: 'user',
      inlineFilter: (row) =>
        row.user_uuid
          ? { full_name: row.user_full_name, uuid: row.user_uuid }
          : undefined,
      render: ({ row }) =>
        row.user_full_name ? (
          <span className="flex items-center gap-x-2">
            <Avatar name={row.user_full_name} size={32} />
            {row.user_full_name}
          </span>
        ) : (
          DASH_ESCAPE_CODE
        ),
      export: 'user_full_name',
    },
    {
      title: translate('State'),
      id: 'state',
      keys: ['state'],
      orderField: 'state',
      render: ({ row }) => {
        const { variant, active } = getKeyStateVariant(row);
        return (
          <StateIndicator
            label={getStateLabel(row)}
            variant={variant}
            active={active}
            tooltip={getStateTooltip(
              row,
              undefined,
              getRowComponents(row, offerings),
            )}
            shape="pill"
            tone="outline"
          />
        );
      },
      export: 'state',
    },
    {
      title: translate('Usage this month'),
      id: 'current_usages',
      keys: [
        'current_usages',
        'spending_limits',
        'usage_period',
        'offering_uuid',
        'resource_plan_uuid',
        'resource_spending_limits',
      ],
      render: ({ row }) => <KeyUsage row={row} offerings={offerings} />,
      export: (row) => JSON.stringify(row.current_usages ?? {}),
      exportKeys: ['current_usages'],
    },
    {
      title: translate('Estimated cost'),
      id: 'estimated_cost',
      keys: ['estimated_cost'],
      orderField: 'estimated_cost',
      render: ({ row }) => (
        <>{renderFieldOrDash(defaultCurrency(row.estimated_cost))}</>
      ),
      export: 'estimated_cost',
    },
    {
      title: translate('Paused by limit'),
      id: 'paused_by_limit',
      keys: ['paused_by_limit'],
      render: ({ row }) =>
        row.paused_by_limit === null ? (
          <>{DASH_ESCAPE_CODE}</>
        ) : (
          <BooleanField value={row.paused_by_limit} />
        ),
      filter: 'paused_by_limit',
      export: 'paused_by_limit',
      exportKeys: ['paused_by_limit'],
    },
  ];
  return columns;
};

/**
 * The API keys of every resource of the provider's offerings, read-only. The
 * actions on a key stay on its resource's API keys tab, which each row opens.
 */
export const ProviderApiKeysList: FC<{ provider: ServiceProvider | null }> = ({
  provider,
}) => {
  const { params } = useCurrentStateAndParams();
  // The provider's organization, from the route (/providers/:uuid/) rather
  // than the current-customer store: the scope must never fall away, or a
  // provider who also consumes would see their own consumer keys. The
  // resolved provider is null for an organization that is not one, which
  // then gets an empty list.
  const providerCustomerUuid: string = params.uuid;
  const resourceUuid: string | undefined = params.resource_uuid || undefined;
  const values = useFilterValues(PROVIDER_API_KEYS_TABLE);

  const filter = useMemo<KeyQuery>(
    () => ({
      ...selectProviderApiKeysFilter(values),
      provider_uuid: providerCustomerUuid,
      ...(resourceUuid ? { resource_uuid: resourceUuid } : {}),
    }),
    [values, providerCustomerUuid, resourceUuid],
  );

  const tableProps = useTable<ResourceApiKeyStatus>({
    table: PROVIDER_API_KEYS_TABLE,
    fetchData: createFetcher(marketplaceResourceApiKeysList),
    filter,
  });

  // The offerings behind the keys on this page, in one request, to name the
  // usage components and read the plan's components and key limit options.
  const offeringsKey = useMemo(
    () => getOfferingComponentsKey(tableProps.rows as ResourceApiKeyStatus[]),
    [tableProps.rows],
  );
  const { data: offeringList = NO_OFFERINGS } = useQuery({
    queryKey: ['provider-api-keys-offerings', ...offeringsKey],
    queryFn: () =>
      marketplaceProviderOfferingsList({
        query: {
          uuid_list: offeringsKey.join(','),
          field: ['uuid', 'components', 'plans', 'plugin_options'],
          page_size: offeringsKey.length,
        },
      }).then((response) => response.data),
    enabled: offeringsKey.length > 0,
    refetchOnWindowFocus: false,
    staleTime: UI_STALE_TIME,
  });
  const offerings = useMemo(
    () => new Map(offeringList.map((offering) => [offering.uuid, offering])),
    [offeringList],
  );

  const columns = useMemo(
    () => getColumns(providerCustomerUuid, offerings),
    [providerCustomerUuid, offerings],
  );

  const resourceName = resourceUuid
    ? (tableProps.rows as ResourceApiKeyStatus[])?.[0]?.resource_name
    : undefined;

  return (
    <Table<ResourceApiKeyStatus>
      {...tableProps}
      columns={columns}
      title={translate('API keys')}
      verboseName={translate('API keys')}
      subtitle={
        <span className="flex flex-col gap-y-1">
          <ProviderApiKeysSummary
            filter={filter}
            tableLoading={tableProps.loading}
          />
          {resourceUuid && (
            <span>
              {resourceName
                ? translate('Keys of {resource}.', { resource: resourceName })
                : translate('Keys of one resource.')}{' '}
              <Link
                state="marketplace-provider-api-keys"
                params={{ uuid: providerCustomerUuid, resource_uuid: null }}
                label={translate('Show the keys of all resources')}
              />
            </span>
          )}
        </span>
      }
      filters={
        <ProviderApiKeysFilter
          provider={provider}
          providerCustomerUuid={providerCustomerUuid}
          rows={tableProps.rows as ResourceApiKeyStatus[]}
        />
      }
      formId={PROVIDER_API_KEYS_FILTER_FORM_ID}
      initialSorting={{ field: 'estimated_cost', mode: 'desc' }}
      enableExport
    />
  );
};
