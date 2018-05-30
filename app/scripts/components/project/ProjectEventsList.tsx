import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { isEmpty } from '@waldur/core/utils';
import { getEventsList } from '@waldur/events/BaseEventsList';
import { connectAngularComponent } from '@waldur/store/connect';

import { ProjectEventsFilter } from './ProjectEventsFilter';

export const PureProjectEvents = getEventsList({
  mapPropsToFilter: props => {
    const filter = {
      ...props.userFilter,
      scope: props.project.url,
    };
    if (props.userFilter && isEmpty(props.userFilter.feature)) {
      filter.feature = ['projects', 'resources'];
    }
    return filter;
  },
});

const mapStateToProps = state => ({
  userFilter: getFormValues('projectEventsFilter')(state),
});

const ProjectEvents = connect(mapStateToProps)(PureProjectEvents);

const ProjectEventsView = props => (
  <>
    <ProjectEventsFilter/>
    <ProjectEvents {...props}/>
  </>
);

export default connectAngularComponent(ProjectEventsView, ['project']);
