// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { UsersDataAccessHistoryListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter, DateFilter } from '@/table';

export const UserDataAccessHistoryAccessorTypeOptions: UserDataAccessHistoryAccessorTypeOption[] =
  [
    {
      value: 'organization_member',
      label: translate('Organization member'),
    },
    {
      value: 'self',
      label: translate('Self-access'),
    },
    {
      value: 'service_provider',
      label: translate('Service provider'),
    },
    {
      value: 'staff',
      label: translate('Staff'),
    },
    {
      value: 'support',
      label: translate('Support'),
    },
  ];
export interface UserDataAccessHistoryAccessorTypeOption {
  label: string;
  value: string;
}

export const UserDataAccessHistoryFilter: FunctionComponent<{}> = () => (
  <>
    <DateFilter
      title={translate('Start date')}
      name="start_date"
      placeholder={translate('Start date')}
      inline={true}
    />
    <DateFilter
      title={translate('End date')}
      name="end_date"
      placeholder={translate('End date')}
      inline={true}
    />
    <SelectFilter
      title={translate('Accessor type')}
      name="accessor_type"
      getValueLabel={(value: UserDataAccessHistoryAccessorTypeOption) =>
        value?.label
      }
      placeholder={translate('Accessor type')}
      options={UserDataAccessHistoryAccessorTypeOptions}
      getOptionValue={(option: UserDataAccessHistoryAccessorTypeOption) =>
        String(option.value)
      }
      getOptionLabel={(option: UserDataAccessHistoryAccessorTypeOption) =>
        option.label
      }
      isClearable={true}
    />
  </>
);

export const UserDataAccessHistoryFilterFormId = 'UserDataAccessHistoryFilter';

export interface UserDataAccessHistoryFilterFormData {
  start_date: string;
  end_date: string;
  accessor_type: UserDataAccessHistoryAccessorTypeOption;
}

type UserDataAccessHistoryFilterQuery = UsersDataAccessHistoryListData['query'];

export const selectUserDataAccessHistoryFilter = (
  values?: Partial<UserDataAccessHistoryFilterFormData>,
): UserDataAccessHistoryFilterQuery => {
  const filter: UserDataAccessHistoryFilterQuery = {} as any;
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
  }
  return filter;
};
