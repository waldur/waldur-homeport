// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { CustomersUsersListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const CustomersUsersFilter: FunctionComponent<
  CustomersUsersFilterProps
> = (props) => (
  <>
    <SelectFilter
      title={translate('Project role')}
      name="project_role"
      getValueLabel={(value: any) => value?.description}
      placeholder={translate('Project role')}
      options={props.projectRoles}
      getOptionValue={(option) => String(option.name)}
      getOptionLabel={(option) => option.description}
      isClearable={true}
      isMulti={true}
    />
    <SelectFilter
      title={translate('Organization role')}
      name="organization_role"
      getValueLabel={(value: any) => value?.description}
      placeholder={translate('Organization role')}
      options={props.organizationRoles}
      getOptionValue={(option) => String(option.name)}
      getOptionLabel={(option) => option.description}
      isClearable={true}
      isMulti={true}
    />
  </>
);

export const CustomersUsersFilterFormId = 'CustomersUsersFilter';

interface CustomersUsersFilterProps {
  organizationRoles?: any[];
  projectRoles?: any[];
}

export interface CustomersUsersFilterFormData {
  project_role: any[];
  organization_role: any[];
}

type CustomersUsersFilterQuery = CustomersUsersListData['query'];

export const selectCustomersUsersFilter = (
  values?: Partial<CustomersUsersFilterFormData>,
): CustomersUsersFilterQuery => {
  const filter: CustomersUsersFilterQuery = {} as any;
  if (values) {
    if (values.project_role) {
      filter.project_role = values.project_role.map((v: any) => v.name);
    }
    if (values.organization_role) {
      filter.organization_role = values.organization_role.map(
        (v: any) => v.name,
      );
    }
  }
  return filter;
};
