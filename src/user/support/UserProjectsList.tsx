import { connect } from 'react-redux';

import { RootState } from '@waldur/store/reducers';
import { getUserProjectsList } from '@waldur/user/affiliations/ProjectsList';
import { getProject } from '@waldur/workspace/selectors';
import { User } from '@waldur/workspace/types';

interface UserProjectsListProps {
  user: User;
}

const PureUserProjects = getUserProjectsList();

const mapStateToProps = (
  state: RootState,
  ownProps: UserProjectsListProps,
) => ({
  currentProject: getProject(state),
  user: ownProps.user,
});

export const UserProjectsList = connect(mapStateToProps)(PureUserProjects);
