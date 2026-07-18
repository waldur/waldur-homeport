// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { RolesListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { BooleanFilter, SelectFilter } from '@/table';

export const IsSystemRoleOptions: IsSystemRoleOption[] = [
  {
    label: translate('Organization role'),
    value: false,
  },
  {
    label: translate('System role'),
    value: true,
  },
];
export interface IsSystemRoleOption {
  label: string;
  value: boolean;
}

export const RolesFilter: FunctionComponent<RolesFilterProps> = (props) => (
  <>
    <SelectFilter
      title={translate('Scope')}
      name="content_type"
      getValueLabel={(value: any) => value?.label}
      options={props.scopeOptions}
      getOptionValue={(option) => String(option.value)}
      getOptionLabel={(option) => option.label}
      isClearable={true}
      placeholder={translate('Scope')}
    />
    <SelectFilter
      title={translate('Type')}
      name="is_system_role"
      getValueLabel={(value: IsSystemRoleOption) => value?.label}
      options={IsSystemRoleOptions}
      getOptionValue={(option: IsSystemRoleOption) => String(option.value)}
      getOptionLabel={(option: IsSystemRoleOption) => option.label}
      isClearable={true}
      placeholder={translate('Type')}
    />
    <BooleanFilter
      title={translate('Show concealed roles')}
      name="include_concealed"
      badgeValue={(value) =>
        value ? translate('Show concealed roles') : translate('All')
      }
      ellipsis={false}
      parse={(v) => v || undefined}
    />
  </>
);

export const RolesFilterFormId = 'RolesFilter';

interface RolesFilterProps {
  scopeOptions?: any[];
}

export interface RolesFilterFormData {
  content_type: any;
  is_system_role: IsSystemRoleOption;
  include_concealed: boolean;
}

type RolesFilterQuery = RolesListData['query'];

export const selectRolesFilter = (
  values?: Partial<RolesFilterFormData>,
): RolesFilterQuery => {
  const filter: RolesFilterQuery = {} as any;
  if (values) {
    if (values.content_type) {
      filter.content_type = values.content_type.value;
    }
    if (values.is_system_role) {
      filter.is_system_role = values.is_system_role.value;
    }
    if (values.include_concealed) {
      filter.include_concealed = values.include_concealed;
    }
  }
  return filter;
};
