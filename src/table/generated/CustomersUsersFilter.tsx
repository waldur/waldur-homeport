// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { CustomersUsersListData } from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const PureCustomersUsersFilter: FunctionComponent<
  CustomersUsersFilterProps
> = (props) => (
  <>
    <TableFilterItem
      title={translate('Project role')}
      name="project_role"
      getValueLabel={(value) => value?.description}
    >
      <Field
        name="project_role"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Project role')}
            options={props.projectRoles}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option) => option.name}
            getOptionLabel={(option) => option.description}
            isClearable={true}
            isMulti={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Organization role')}
      name="organization_role"
      getValueLabel={(value) => value?.description}
    >
      <Field
        name="organization_role"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Organization role')}
            options={props.organizationRoles}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option) => option.name}
            getOptionLabel={(option) => option.description}
            isClearable={true}
            isMulti={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const CustomersUsersFilterFormId = 'CustomersUsersFilter';

interface CustomersUsersFilterProps {
  projectRoles: any[];
  organizationRoles: any[];
}

interface CustomersUsersFilterFormData {
  project_role: any[];
  organization_role: any[];
}

export const CustomersUsersFilter = reduxForm<
  CustomersUsersFilterFormData,
  CustomersUsersFilterProps
>({
  form: CustomersUsersFilterFormId,
  destroyOnUnmount: false,
})(PureCustomersUsersFilter);

export const selectCustomersUsersFilter = createSelector(
  getFormValues(CustomersUsersFilterFormId),
  (values: CustomersUsersFilterFormData | undefined) => {
    const filter: CustomersUsersListData['query'] = {};
    if (values) {
      if (values.project_role) {
        filter.project_role = values.project_role.map((v) => v.name) as any;
      }
      if (values.organization_role) {
        filter.organization_role = values.organization_role.map(
          (v) => v.name,
        ) as any;
      }
    }
    return filter;
  },
);
