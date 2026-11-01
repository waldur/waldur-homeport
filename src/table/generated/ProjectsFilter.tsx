// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { ProjectsListData, User, usersList } from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, BooleanFilter, SelectFilter } from '@/table';

export const IsRemovedOptions: IsRemovedOption[] = [
  {
    label: translate('Not removed'),
    value: false,
  },
  {
    label: translate('Removed'),
    value: true,
  },
  {
    label: translate('All projects'),
    value: 'undefined',
  },
];
export interface IsRemovedOption {
  label: string;
  value: any;
}

export const ProjectsFilter: FunctionComponent<{}> = () => (
  <>
    <AsyncSelectFilter
      title={translate('Project administrator')}
      name="administrator"
      getValueLabel={(value: User) =>
        value?.full_name || value?.username || value?.email
      }
      loadOptions={createLoadOptions(usersList, 'full_name', {
        o: ['full_name'],
      })}
      defaultOptions
      getOptionValue={(option: User) => String(option.uuid || '')}
      getOptionLabel={(option: User) =>
        String(option.full_name || option.username || option.email || '')
      }
      isClearable={true}
      placeholder={translate('Project administrator')}
    />
    <BooleanFilter
      title={translate('Conceal finished projects')}
      name="conceal_finished_projects"
      badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      ellipsis={false}
      parse={(v) => v || undefined}
    />
    <BooleanFilter
      title={translate('Include removed')}
      name="include_terminated"
      badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      ellipsis={false}
      parse={(v) => v || undefined}
    />
    <SelectFilter
      title={translate('Removal status')}
      name="is_removed"
      getValueLabel={(value: IsRemovedOption) => value?.label}
      options={IsRemovedOptions}
      getOptionValue={(option: IsRemovedOption) => String(option.value)}
      getOptionLabel={(option: IsRemovedOption) => option.label}
      isClearable={true}
      placeholder={translate('Select removal status')}
    />
  </>
);

export const ProjectsFilterFormId = 'ProjectsFilter';

export interface ProjectsFilterFormData {
  administrator: User;
  conceal_finished_projects: boolean;
  include_terminated: boolean;
  is_removed: IsRemovedOption;
}

type ProjectsFilterQuery = ProjectsListData['query'];

export const selectProjectsFilter = (
  values?: Partial<ProjectsFilterFormData>,
): ProjectsFilterQuery => {
  const filter: ProjectsFilterQuery = {} as any;
  if (values) {
    if (values.administrator) {
      filter.user_uuid_with_active_role = values.administrator.uuid;
    }
    if (values.conceal_finished_projects) {
      filter.conceal_finished_projects = values.conceal_finished_projects;
    }
    if (values.include_terminated) {
      filter.include_terminated = values.include_terminated;
    }
    if (values.is_removed) {
      filter.is_removed = values.is_removed.value;
    }
  }
  return filter;
};
