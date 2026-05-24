// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { ProjectsListUsersListData } from 'waldur-js-client';

import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const ProjectsListUsersFilter: FunctionComponent<
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
          variant="tableFilter"
        />
      )}
    />
  </TableFilterItem>
);

export const ProjectsListUsersFilterFormId = 'ProjectsListUsersFilter';

interface ProjectsListUsersFilterProps {
  projectRoles?: any[];
}

export interface ProjectsListUsersFilterFormData {
  project_role: any;
}

type ProjectsListUsersFilterQuery = ProjectsListUsersListData['query'];

export const selectProjectsListUsersFilter = (
  values?: Partial<ProjectsListUsersFilterFormData>,
): ProjectsListUsersFilterQuery => {
  const filter: ProjectsListUsersFilterQuery = {} as any;
  if (values) {
    if (values.project_role) {
      filter.role = values.project_role.name;
    }
  }
  return filter;
};
