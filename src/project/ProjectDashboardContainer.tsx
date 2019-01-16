import { connect } from 'react-redux';

import { connectAngularComponent } from '@waldur/store/connect';
import { getUser, getProject } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

import { ProjectDashboard } from './ProjectDashboard';

const mapStateToProps = (state: OuterState) => ({
  user: getUser(state),
  project: getProject(state),
});

const ProjectDashboardContainer = connect(mapStateToProps)(ProjectDashboard);

export default connectAngularComponent(ProjectDashboardContainer);
