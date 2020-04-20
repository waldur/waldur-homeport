import { connect } from 'react-redux';

import { getEventsList } from '@waldur/events/BaseEventsList';
import { getProject } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

const EVENT_TYPES = ['role_granted', 'role_revoked', 'role_updated'];

export const PureProjectPermissionsLogList = getEventsList({
  mapPropsToFilter: props =>
    props.project
      ? {
          scope: props.project.url,
          event_type: EVENT_TYPES,
        }
      : { event_type: EVENT_TYPES },
});

const enhance = connect((state: OuterState) => ({
  project: getProject(state),
}));

export const ProjectPermissionsLogList = enhance(PureProjectPermissionsLogList);
