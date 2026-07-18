// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { RolesListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const AdminRolesIsSystemRoleOptions: AdminRolesIsSystemRoleOption[] = [
  {
    label: translate('Custom'),
    value: false,
  },
  {
    label: translate('System'),
    value: true,
  },
];
export interface AdminRolesIsSystemRoleOption {
  label: string;
  value: boolean;
}

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

export const ScopeTypeOptions: ScopeTypeOption[] = [
  {
    label: translate('Call'),
    value: 'call',
  },
  {
    label: translate('Call managing organization'),
    value: 'call_organizer',
  },
  {
    label: translate('Organization'),
    value: 'customer',
  },
  {
    label: translate('Offering'),
    value: 'offering',
  },
  {
    label: translate('Project'),
    value: 'project',
  },
  {
    label: translate('Proposal'),
    value: 'proposal',
  },
  {
    label: translate('Service provider organization'),
    value: 'service_provider',
  },
];
export interface ScopeTypeOption {
  label: string;
  value: string;
}

export const AdminRolesFilter: FunctionComponent<{}> = () => (
  <>
    <SelectFilter
      title={translate('Scope')}
      name="content_type"
      getValueLabel={(value: ScopeTypeOption) => value?.label}
      options={ScopeTypeOptions}
      getOptionValue={(option: ScopeTypeOption) => String(option.value)}
      getOptionLabel={(option: ScopeTypeOption) => option.label}
      isClearable={true}
      placeholder={translate('Scope')}
    />
    <SelectFilter
      title={translate('Type')}
      name="is_system_role"
      getValueLabel={(value: AdminRolesIsSystemRoleOption) => value?.label}
      options={AdminRolesIsSystemRoleOptions}
      getOptionValue={(option: AdminRolesIsSystemRoleOption) =>
        String(option.value)
      }
      getOptionLabel={(option: AdminRolesIsSystemRoleOption) => option.label}
      isClearable={true}
      placeholder={translate('Type')}
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

export const AdminRolesFilterFormId = 'AdminRolesFilter';

export interface AdminRolesFilterFormData {
  content_type: ScopeTypeOption;
  is_system_role: AdminRolesIsSystemRoleOption;
  is_active: IsActiveOption;
}

type AdminRolesFilterQuery = RolesListData['query'];

export const selectAdminRolesFilter = (
  values?: Partial<AdminRolesFilterFormData>,
): AdminRolesFilterQuery => {
  const filter: AdminRolesFilterQuery = {} as any;
  if (values) {
    if (values.content_type) {
      filter.content_type = values.content_type.value;
    }
    if (values.is_system_role) {
      filter.is_system_role = values.is_system_role.value;
    }
    if (values.is_active) {
      filter.is_active = values.is_active.value;
    }
  }
  return filter;
};
