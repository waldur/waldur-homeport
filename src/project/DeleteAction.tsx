import { useSelector, useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import {
  deleteProject,
  showProjectRemoveDialog,
} from '@waldur/project/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { isOwnerOrStaff as isOwnerOrStaffSelector } from '@waldur/workspace/selectors';

export const DeleteAction = ({ project }) => {
  const dispatch = useDispatch();
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);

  const callback = () => {
    dispatch(
      showProjectRemoveDialog(
        () => dispatch(deleteProject(project)),
        project.name,
      ),
    );
  };

  return (
    <ActionItem
      title={translate('Delete')}
      action={callback}
      disabled={!isOwnerOrStaff}
    />
  );
};
