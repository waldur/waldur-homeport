import { connect } from 'react-redux';

import { getEventsList } from '@waldur/events/BaseEventsList';
import { getProject } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

export const PureProjectPermissionsLogList = getEventsList({
  mapPropsToFilter: props => ({
    scope: props.project.url,
    event_type: ['role_granted', 'role_revoked', 'role_updated'],
  }),
});

const enhance = connect((state: OuterState) => ({
  project: getProject(state),
}));

export const ProjectPermissionsLogList = enhance(PureProjectPermissionsLogList);
