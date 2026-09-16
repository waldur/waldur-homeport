// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  Customer,
  SramGroupKindEnum,
  SramGroupsListData,
  customersList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter } from '@/table';

export const SramGroupKindOptions: SramGroupKindOption[] = [
  {
    label: translate('Collaboration'),
    value: 'co',
  },
  {
    label: translate('Group'),
    value: 'group',
  },
];
export interface SramGroupKindOption {
  label: string;
  value: SramGroupKindEnum;
}

export const SramGroupsFilter: FunctionComponent<{}> = () => (
  <>
    <AsyncSelectFilter
      title={translate('Organization')}
      name="customer_uuid"
      getValueLabel={(value: Customer) => value?.name}
      loadOptions={createLoadOptions(customersList, 'query')}
      defaultOptions
      getOptionValue={(option: Customer) => String(option.uuid || '')}
      getOptionLabel={(option: Customer) => String(option.name || '')}
      isClearable={true}
      placeholder={translate('Organization')}
    />
    <SelectFilter
      title={translate('Kind')}
      name="kind"
      getValueLabel={(value: SramGroupKindOption) => value?.label}
      options={SramGroupKindOptions}
      getOptionValue={(option: SramGroupKindOption) => String(option.value)}
      getOptionLabel={(option: SramGroupKindOption) => option.label}
      isClearable={true}
      placeholder={translate('Kind')}
    />
  </>
);

export const SramGroupsFilterFormId = 'SramGroupsFilter';

export interface SramGroupsFilterFormData {
  customer_uuid: Customer;
  kind: SramGroupKindOption;
}

type SramGroupsFilterQuery = SramGroupsListData['query'];

export const selectSramGroupsFilter = (
  values?: Partial<SramGroupsFilterFormData>,
): SramGroupsFilterQuery => {
  const filter: SramGroupsFilterQuery = {} as any;
  if (values) {
    if (values.customer_uuid) {
      filter.customer_uuid = values.customer_uuid.uuid;
    }
    if (values.kind) {
      filter.kind = values.kind.value;
    }
  }
  return filter;
};
