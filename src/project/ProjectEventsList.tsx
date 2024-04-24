import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { isEmpty } from '@waldur/core/utils';
import { BaseEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectEventsFilter } from './ProjectEventsFilter';

const mapStateToFilter = createSelector(
  getFormValues('projectEventsFilter'),
  getProject,
  (userFilter: any, project) => {
    const filter = {
      ...userFilter,
      feature: userFilter?.feature?.map((option) => option.value),
    };
    if (project) {
      filter.scope = project.url;
    }
    if (userFilter && isEmpty(userFilter.feature)) {
      filter.feature = ['projects', 'resources'];
    }
    return filter;
  },
);

export const ProjectEventsView: FunctionComponent = () => {
  const project = useSelector(getProject);
  const filter = useSelector(mapStateToFilter);
  return (
    <BaseEventsList
      table={`project-events-${project?.uuid}`}
      title={translate('Audit logs')}
      filter={filter}
      filters={<ProjectEventsFilter />}
      initialPageSize={5}
    />
  );
};
