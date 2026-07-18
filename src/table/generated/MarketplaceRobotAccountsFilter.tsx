// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  MarketplaceRobotAccountsListData,
  NameUuid,
  marketplaceServiceProvidersRobotAccountCustomersList,
  marketplaceServiceProvidersRobotAccountProjectsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter } from '@/table';

export const MarketplaceRobotAccountsFilter: FunctionComponent<
  MarketplaceRobotAccountsFilterProps
> = (props) => (
  <>
    <AsyncSelectFilter
      title={translate('Organization')}
      name="customer"
      getValueLabel={(value: NameUuid) => value?.name}
      placeholder={translate('Organization')}
      loadOptions={createLoadOptions(
        marketplaceServiceProvidersRobotAccountCustomersList,
        'customer_name',
        {},
        { uuid: props.provider.uuid },
      )}
      defaultOptions
      getOptionValue={(option: NameUuid) => String(option.uuid || '')}
      getOptionLabel={(option: NameUuid) => String(option.name || '')}
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('Project')}
      name="project_uuid"
      getValueLabel={(value: NameUuid) => value?.name}
      placeholder={translate('Project')}
      loadOptions={createLoadOptions(
        marketplaceServiceProvidersRobotAccountProjectsList,
        'project_name',
        {},
        { uuid: props.provider.uuid },
      )}
      defaultOptions
      getOptionValue={(option: NameUuid) => String(option.uuid || '')}
      getOptionLabel={(option: NameUuid) => String(option.name || '')}
      isClearable={true}
    />
  </>
);

export const MarketplaceRobotAccountsFilterFormId =
  'MarketplaceRobotAccountsFilter';

interface MarketplaceRobotAccountsFilterProps {
  provider?: any;
}

export interface MarketplaceRobotAccountsFilterFormData {
  customer: NameUuid;
  project_uuid: NameUuid;
}

type MarketplaceRobotAccountsFilterQuery =
  MarketplaceRobotAccountsListData['query'];

export const selectMarketplaceRobotAccountsFilter = (
  values?: Partial<MarketplaceRobotAccountsFilterFormData>,
): MarketplaceRobotAccountsFilterQuery => {
  const filter: MarketplaceRobotAccountsFilterQuery = {} as any;
  if (values) {
    if (values.customer) {
      filter.customer_uuid = values.customer.uuid;
    }
    if (values.project_uuid) {
      filter.project_uuid = values.project_uuid.uuid;
    }
  }
  return filter;
};
