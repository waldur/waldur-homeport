import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { isVisible } from '@waldur/store/config';
import { connectAngularComponent } from '@waldur/store/connect';
import { getUser, getProject, isManager, isOwnerOrStaff } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

import { ProjectDashboard } from './ProjectDashboard';

const canAddUser = createSelector(
  isManager,
  isOwnerOrStaff,
  (manager, ownerOrStaf) => manager || ownerOrStaf,
);

const mapStateToProps = (state: OuterState) => ({
  user: getUser(state),
  project: getProject(state),
  canAddUser: canAddUser(state),
  marketplaceEnabled: isVisible(state, 'marketplace'),
});

const ProjectDashboardContainer = connect(mapStateToProps)(ProjectDashboard);

export default connectAngularComponent(ProjectDashboardContainer);
