// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { ProjectsListUsersListData } from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const PureProjectsListUsersFilter: FunctionComponent<
  ProjectsListUsersFilterProps
> = (props) => (
  <TableFilterItem
    title={translate('Role')}
    name="project_role"
    getValueLabel={(value) => value?.description}
  >
    <Field
      name="project_role"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Role')}
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
);

export const ProjectsListUsersFilterFormId = 'ProjectsListUsersFilter';

interface ProjectsListUsersFilterProps {
  projectRoles: any[];
}

interface ProjectsListUsersFilterFormData {
  project_role: any[];
}

export const ProjectsListUsersFilter = reduxForm<
  ProjectsListUsersFilterFormData,
  ProjectsListUsersFilterProps
>({
  form: ProjectsListUsersFilterFormId,
  destroyOnUnmount: false,
})(PureProjectsListUsersFilter);

export const selectProjectsListUsersFilter = createSelector(
  getFormValues(ProjectsListUsersFilterFormId),
  (values: ProjectsListUsersFilterFormData | undefined) => {
    const filter: ProjectsListUsersListData['query'] = {};
    if (values) {
      if (values.project_role) {
        filter.role = values.project_role.map((v) => v.name) as any;
      }
    }
    return filter;
  },
);
