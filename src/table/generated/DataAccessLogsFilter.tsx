// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  AccessorTypeEnum,
  DataAccessLogsListData,
  User,
  usersList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter, DateFilter } from '@/table';

export const AccessorTypeOptions: AccessorTypeOption[] = [
  {
    label: translate('Organization member'),
    value: 'organization_member',
  },
  {
    label: translate('Self'),
    value: 'self',
  },
  {
    label: translate('Service provider'),
    value: 'service_provider',
  },
  {
    label: translate('Staff'),
    value: 'staff',
  },
  {
    label: translate('Support'),
    value: 'support',
  },
];
export interface AccessorTypeOption {
  label: string;
  value: AccessorTypeEnum;
}

export const DataAccessLogsFilter: FunctionComponent<{}> = () => (
  <>
    <DateFilter
      title={translate('Start date')}
      name="start_date"
      placeholder={translate('Start date')}
    />
    <DateFilter
      title={translate('End date')}
      name="end_date"
      placeholder={translate('End date')}
    />
    <SelectFilter
      title={translate('Accessor type')}
      name="accessor_type"
      getValueLabel={(value: AccessorTypeOption) => value?.label}
      placeholder={translate('Accessor type')}
      options={AccessorTypeOptions}
      getOptionValue={(option: AccessorTypeOption) => String(option.value)}
      getOptionLabel={(option: AccessorTypeOption) => option.label}
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('User')}
      name="user"
      getValueLabel={(value: User) =>
        value?.full_name || value?.username || value?.email
      }
      placeholder={translate('User')}
      loadOptions={createLoadOptions(usersList, 'full_name', {
        o: ['full_name'],
      })}
      defaultOptions
      getOptionValue={(option: User) => String(option.uuid || '')}
      getOptionLabel={(option: User) =>
        String(option.full_name || option.username || option.email || '')
      }
      isClearable={true}
    />
  </>
);

export const DataAccessLogsFilterFormId = 'DataAccessLogsFilter';

export interface DataAccessLogsFilterFormData {
  start_date: string;
  end_date: string;
  accessor_type: AccessorTypeOption;
  user: User;
}

type DataAccessLogsFilterQuery = DataAccessLogsListData['query'];

export const selectDataAccessLogsFilter = (
  values?: Partial<DataAccessLogsFilterFormData>,
): DataAccessLogsFilterQuery => {
  const filter: DataAccessLogsFilterQuery = {} as any;
  if (values) {
    if (values.start_date) {
      filter.start_date = values.start_date;
    }
    if (values.end_date) {
      filter.end_date = values.end_date;
    }
    if (values.accessor_type) {
      filter.accessor_type = values.accessor_type.value;
    }
    if (values.user) {
      filter.user_uuid = values.user.uuid;
    }
  }
  return filter;
};
