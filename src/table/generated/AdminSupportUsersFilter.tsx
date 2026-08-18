// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  SupportUsersListData,
  WaldursupportactivebackendtypeEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const IsActiveOptions: IsActiveOption[] = [
  {
    label: translate('Inactive'),
    value: false,
  },
  {
    label: translate('Active'),
    value: true,
  },
];
export interface IsActiveOption {
  label: string;
  value: boolean;
}

export const WaldursupportactivebackendtypeOptions: WaldursupportactivebackendtypeOption[] =
  [
    {
      label: translate('Atlassian'),
      value: 'atlassian',
    },
    {
      label: translate('Basic'),
      value: 'basic',
    },
    {
      label: translate('Smax'),
      value: 'smax',
    },
    {
      label: translate('Zammad'),
      value: 'zammad',
    },
  ];
export interface WaldursupportactivebackendtypeOption {
  label: string;
  value: WaldursupportactivebackendtypeEnum;
}

export const AdminSupportUsersFilter: FunctionComponent<{}> = () => (
  <>
    <SelectFilter
      title={translate('Helpdesk')}
      name="backend_name"
      getValueLabel={(value: WaldursupportactivebackendtypeOption) =>
        value?.label
      }
      options={WaldursupportactivebackendtypeOptions}
      getOptionValue={(option: WaldursupportactivebackendtypeOption) =>
        String(option.value)
      }
      getOptionLabel={(option: WaldursupportactivebackendtypeOption) =>
        option.label
      }
      isClearable={true}
      placeholder={translate('Helpdesk')}
    />
    <SelectFilter
      title={translate('Status')}
      name="is_active"
      getValueLabel={(value: IsActiveOption) => value?.label}
      options={IsActiveOptions}
      getOptionValue={(option: IsActiveOption) => String(option.value)}
      getOptionLabel={(option: IsActiveOption) => option.label}
      isClearable={true}
      placeholder={translate('Status')}
    />
  </>
);

export const AdminSupportUsersFilterFormId = 'AdminSupportUsersFilter';

export interface AdminSupportUsersFilterFormData {
  backend_name: WaldursupportactivebackendtypeOption;
  is_active: IsActiveOption;
}

type AdminSupportUsersFilterQuery = SupportUsersListData['query'];

export const selectAdminSupportUsersFilter = (
  values?: Partial<AdminSupportUsersFilterFormData>,
): AdminSupportUsersFilterQuery => {
  const filter: AdminSupportUsersFilterQuery = {} as any;
  if (values) {
    if (values.backend_name) {
      filter.backend_name = values.backend_name.value;
    }
    if (values.is_active) {
      filter.is_active = values.is_active.value;
    }
  }
  return filter;
};
