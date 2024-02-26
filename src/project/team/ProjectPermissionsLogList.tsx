import { connect } from 'react-redux';

import { PermissionsLogList } from '@waldur/permissions/PermissionsLogList';
import { RootState } from '@waldur/store/reducers';
import { getProject } from '@waldur/workspace/selectors';

export const ProjectPermissionsLogList = connect((state: RootState) => ({
  scope: getProject(state),
}))(PermissionsLogList);
