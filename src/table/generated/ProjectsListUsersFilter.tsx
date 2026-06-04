// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { ProjectsListUsersListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const ProjectsListUsersFilter: FunctionComponent<
  ProjectsListUsersFilterProps
> = (props) => (
  <SelectFilter
    title={translate('Role')}
    name="project_role"
    getValueLabel={(value: any) => value?.description}
    placeholder={translate('Role')}
    options={props.projectRoles}
    getOptionValue={(option) => String(option.name)}
    getOptionLabel={(option) => option.description}
    isClearable={true}
  />
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
