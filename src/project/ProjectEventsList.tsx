import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { isEmpty } from '@waldur/core/utils';
import { getEventsList } from '@waldur/events/BaseEventsList';
import { RootState } from '@waldur/store/reducers';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectEventsFilter } from './ProjectEventsFilter';

export const PureProjectEvents = getEventsList({
  mapPropsToFilter: (props) => {
    const filter = {
      ...props.userFilter,
    };
    if (props.project) {
      filter.scope = props.project.url;
    }
    if (props.userFilter && isEmpty(props.userFilter.feature)) {
      filter.feature = ['projects', 'resources'];
    }
    return filter;
  },
});

const mapStateToProps = (state: RootState) => ({
  userFilter: getFormValues('projectEventsFilter')(state),
  project: getProject(state),
});

const ProjectEvents = connect(mapStateToProps)(PureProjectEvents);

export const ProjectEventsView: FunctionComponent<any> = (props) => (
  <>
    <ProjectEventsFilter />
    <ProjectEvents {...props} />
  </>
);
