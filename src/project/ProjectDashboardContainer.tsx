import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { RootState } from '@waldur/store/reducers';
import {
  getUser,
  getProject,
  isManager,
  isOwnerOrStaff,
} from '@waldur/workspace/selectors';

import { ProjectDashboard } from './ProjectDashboard';

const canAddUser = createSelector(
  isManager,
  isOwnerOrStaff,
  (manager, ownerOrStaf) => manager || ownerOrStaf,
);

const mapStateToProps = (state: RootState) => ({
  user: getUser(state),
  project: getProject(state),
  canAddUser: canAddUser(state),
});

export const ProjectDashboardContainer = connect(mapStateToProps)(
  ProjectDashboard,
);
