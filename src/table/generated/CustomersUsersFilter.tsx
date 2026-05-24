// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { CustomersUsersListData } from 'waldur-js-client';

import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const CustomersUsersFilter: FunctionComponent<
  CustomersUsersFilterProps
> = (props) => (
  <>
    <TableFilterItem
      title={translate('Project role')}
      name="project_role"
      getValueLabel={(value: any) => value?.description}
    >
      <Field
        name="project_role"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Project role')}
            options={props.projectRoles}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option) => String(option.name)}
            getOptionLabel={(option) => option.description}
            isClearable={true}
            isMulti={true}
            variant="tableFilter"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Organization role')}
      name="organization_role"
      getValueLabel={(value: any) => value?.description}
    >
      <Field
        name="organization_role"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Organization role')}
            options={props.organizationRoles}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option) => String(option.name)}
            getOptionLabel={(option) => option.description}
            isClearable={true}
            isMulti={true}
            variant="tableFilter"
          />
        )}
      />
    </TableFilterItem>
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
