import { FC, useMemo } from 'react';
import {
  MarketplaceResourceApiKeysListData,
  MarketplaceServiceProviderUser,
  ResourceApiKeyState,
  ResourceApiKeyStatus,
  ServiceProvider,
  marketplaceServiceProvidersCustomersList,
  marketplaceServiceProvidersProjectsList,
  marketplaceServiceProvidersUsersList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { OfferingFilter } from '@/marketplace/offerings/details/OfferingFilter';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { AsyncSelectFilter, SelectFilter } from '@/table';
import { useUser } from '@/workspace/hooks';

export const PROVIDER_API_KEYS_FILTER_FORM_ID = 'ProviderApiKeysFilter';

interface Option<T> {
  label: string;
  value: T;
}

const getStateOptions = (): Option<ResourceApiKeyState>[] => [
  { value: 'Creating', label: translate('Creating') },
  { value: 'OK', label: translate('OK') },
  { value: 'Updating', label: translate('Updating') },
  { value: 'Paused', label: translate('Paused') },
  { value: 'Deleting', label: translate('Deleting') },
  { value: 'Deleted', label: translate('Deleted') },
  { value: 'Erred', label: translate('Erred') },
];

const getPausedByLimitOptions = (): Option<boolean>[] => [
  { value: true, label: translate('Paused by a limit') },
  { value: false, label: translate('Not paused by a limit') },
];

export interface ProviderApiKeysFilterValues {
  offering?: NamedOption;
  customer?: NamedOption;
  project?: NamedOption;
  state?: Option<ResourceApiKeyState>[];
  paused_by_limit?: Option<boolean>;
  user?: AssigneeOption;
}

type KeyQuery = NonNullable<MarketplaceResourceApiKeysListData['query']>;

export const selectProviderApiKeysFilter = (
  values?: ProviderApiKeysFilterValues,
): KeyQuery => {
  const filter: KeyQuery = {};
  if (values?.offering) filter.offering_uuid = values.offering.uuid;
  if (values?.customer) filter.customer_uuid = values.customer.uuid;
  if (values?.project) filter.project_uuid = values.project.uuid;
  if (values?.state?.length) {
    filter.state = values.state.map((option) => option.value);
  }
  if (values?.paused_by_limit) {
    filter.paused_by_limit = values.paused_by_limit.value;
  }
  if (values?.user) filter.user_uuid = values.user.uuid;
  return filter;
};

interface NamedOption {
  uuid: string;
  name: string;
}

// A provider user from the provider's list, or an assignee from a loaded key.
type AssigneeOption = Partial<
  Pick<MarketplaceServiceProviderUser, 'full_name'>
> &
  Partial<NamedOption> & { uuid: string };

/** An offering from the picker carries its category; one from a row does not. */
export const getOfferingLabel = (
  option: NamedOption & { category_title?: string },
) =>
  option?.category_title
    ? `${option.category_title} / ${option.name}`
    : option?.name;

/**
 * A provider user from the provider's list carries full_name; an assignee
 * taken from the loaded keys carries name.
 */
export const getAssigneeLabel = (option?: AssigneeOption) =>
  option?.full_name ?? option?.name;

/**
 * A loader over the distinct values of the loaded keys, searched by name, for
 * a caller who may not list the provider's organizations, projects or users.
 */
export const getRowOptionsLoader =
  (
    rows: ResourceApiKeyStatus[],
    pick: (row: ResourceApiKeyStatus) => NamedOption | undefined,
  ) =>
  (query: string) => {
    const byUuid = new Map<string, NamedOption>();
    for (const row of rows) {
      const option = pick(row);
      if (option?.uuid) byUuid.set(option.uuid, option);
    }
    const search = (query ?? '').toLowerCase();
    const options = [...byUuid.values()]
      .filter((option) => option.name?.toLowerCase().includes(search))
      .sort((a, b) => a.name.localeCompare(b.name));
    return Promise.resolve({
      options,
      hasMore: false,
      additional: { page: 1 },
    });
  };

/**
 * The pickers of the provider's key list. The offering picker lists what the
 * caller may see of the provider's offerings. The organization, project and
 * assignee pickers list the provider's own through endpoints that need
 * SERVICE_PROVIDER.LIST_* on the provider organization or its service
 * provider. An offering manager does not hold those, so for them the pickers
 * offer the values of the keys on the page, and the row cells filter by any
 * value shown.
 */
export const ProviderApiKeysFilter: FC<{
  // Null for an organization that is not a service provider.
  provider: ServiceProvider | null;
  // The provider's organization, from the route rather than the
  // current-customer store, which the page does not own.
  providerCustomerUuid: string;
  rows: ResourceApiKeyStatus[];
}> = ({ provider, providerCustomerUuid, rows }) => {
  const user = useUser();
  // The provider's own lists are addressed by its service provider record;
  // without one, the pickers offer the values on the page.
  const can = (permission: string) =>
    !!provider &&
    hasPermission(user, { permission, customerId: providerCustomerUuid });
  const path = useMemo(
    () => ({ service_provider_uuid: provider?.uuid }),
    [provider?.uuid],
  );
  // Every offering of the provider the caller may see, private ones included,
  // as the provider resource list offers them.
  const offeringFilter = useMemo(
    () => ({ customer_uuid: providerCustomerUuid }),
    [providerCustomerUuid],
  );
  // The pickers that offer the page's values must drop what they cached when
  // the page changes, or they keep offering the rows of the first render.
  const rowsKey = useMemo(
    () => rows?.map((row) => row.uuid).join(',') ?? '',
    [rows],
  );
  const loader = (
    permission: string,
    listMethod: Parameters<typeof createLoadOptions>[0],
    pick: (row: ResourceApiKeyStatus) => NamedOption | undefined,
  ) =>
    can(permission)
      ? { loadOptions: createLoadOptions(listMethod, 'query', {}, path) }
      : {
          loadOptions: getRowOptionsLoader(rows ?? [], pick),
          cacheUniqs: [rowsKey],
        };
  return (
    <>
      <OfferingFilter
        offeringFilter={offeringFilter}
        // A row's inline filter carries the offering's name alone.
        badgeValue={(value: NamedOption) => value?.name}
        getOptionLabel={getOfferingLabel}
        isClearable
      />
      <AsyncSelectFilter
        title={translate('Client organization')}
        name="customer"
        badgeValue={(value: NamedOption) => value?.name}
        placeholder={translate('Client organization')}
        {...loader(
          PermissionEnum.LIST_SERVICE_PROVIDER_CUSTOMERS,
          marketplaceServiceProvidersCustomersList,
          (row) => ({ uuid: row.customer_uuid, name: row.customer_name }),
        )}
        defaultOptions
        getOptionValue={(option: NamedOption) => option.uuid}
        getOptionLabel={(option: NamedOption) => option.name}
        isClearable
      />
      <AsyncSelectFilter
        title={translate('Project')}
        name="project"
        badgeValue={(value: NamedOption) => value?.name}
        placeholder={translate('Project')}
        {...loader(
          PermissionEnum.LIST_SERVICE_PROVIDER_PROJECTS,
          marketplaceServiceProvidersProjectsList,
          (row) => ({ uuid: row.project_uuid, name: row.project_name }),
        )}
        defaultOptions
        getOptionValue={(option: NamedOption) => option.uuid}
        getOptionLabel={(option: NamedOption) => option.name}
        isClearable
      />
      <SelectFilter
        title={translate('State')}
        name="state"
        badgeValue={(value: Option<ResourceApiKeyState>[]) =>
          value?.map((option) => option.label).join(', ')
        }
        placeholder={translate('State')}
        options={getStateOptions()}
        isMulti
        isClearable
      />
      <SelectFilter
        title={translate('Paused by limit')}
        name="paused_by_limit"
        badgeValue={(value: Option<boolean>) => value?.label}
        placeholder={translate('Paused by limit')}
        options={getPausedByLimitOptions()}
        getOptionValue={(option: Option<boolean>) => String(option.value)}
        isClearable
      />
      <AsyncSelectFilter
        title={translate('Assignee')}
        name="user"
        badgeValue={getAssigneeLabel}
        placeholder={translate('Assignee')}
        {...loader(
          PermissionEnum.LIST_SERVICE_PROVIDER_USERS,
          marketplaceServiceProvidersUsersList,
          (row) =>
            row.user_uuid
              ? { uuid: row.user_uuid, name: row.user_full_name }
              : undefined,
        )}
        defaultOptions
        getOptionValue={(option: AssigneeOption) => option.uuid}
        getOptionLabel={getAssigneeLabel}
        isClearable
      />
    </>
  );
};
