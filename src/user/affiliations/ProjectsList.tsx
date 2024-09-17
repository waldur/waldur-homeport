import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { getUser } from '@waldur/workspace/selectors';

import { BaseProjectsList } from './BaseProjectsList';
import { ProjectsListFilter } from './ProjectsListFilter';

const mapStateToFilter = createSelector(
  getFormValues('affiliationProjectsListFilter'),
  getUser,
  (stateFilter: any, user) => {
    const filter: any = {};
    if (
      stateFilter &&
      stateFilter.organization &&
      Array.isArray(stateFilter.organization)
    ) {
      filter.customer = stateFilter.organization.map((x) => x.uuid).join(',');
    }
    filter.user_uuid = user.uuid;
    return filter;
  },
);

export const ProjectsList = () => {
  const filter = useSelector(mapStateToFilter);
  return (
    <BaseProjectsList
      filters={<ProjectsListFilter />}
      filter={filter}
      standalone
    />
  );
};
