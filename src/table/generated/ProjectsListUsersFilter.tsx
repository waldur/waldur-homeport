// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { ProjectsListUsersListData } from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { RootState } from '@/store/reducers';
import { TableFilterItem } from '@/table/TableFilterItem';

const PureProjectsListUsersFilter: FunctionComponent<
  ProjectsListUsersFilterProps
> = (props) => (
  <TableFilterItem
    title={translate('Role')}
    name="project_role"
    getValueLabel={(value: any) => value?.description}
  >
    <Field
      name="project_role"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Role')}
          options={props.projectRoles}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option) => String(option.name)}
          getOptionLabel={(option) => option.description}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const ProjectsListUsersFilterFormId = 'ProjectsListUsersFilter';

interface ProjectsListUsersFilterProps {
  projectRoles?: any[];
}

interface ProjectsListUsersFilterFormData {
  project_role: any;
}

export const ProjectsListUsersFilter = reduxForm<
  ProjectsListUsersFilterFormData,
  ProjectsListUsersFilterProps
>({
  form: ProjectsListUsersFilterFormId,
  destroyOnUnmount: false,
})(PureProjectsListUsersFilter);

type ProjectsListUsersFilterQuery = ProjectsListUsersListData['query'];

export const selectProjectsListUsersFilter = createSelector<
  RootState,
  Partial<ProjectsListUsersFilterFormData>,
  ProjectsListUsersFilterQuery
>(getFormValues(ProjectsListUsersFilterFormId), (values) => {
  const filter: ProjectsListUsersFilterQuery = {} as any;
  if (values) {
    if (values.project_role) {
      filter.role = values.project_role.name;
    }
  }
  return filter;
});
