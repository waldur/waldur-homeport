import { useSelector, useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

const MoveProjectDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "MoveProjectDialog" */ './MoveProjectDialog'),
  'MoveProjectDialog',
);

export const MoveProjectAction = ({ project }: { project: Project }) => {
  const dispatch = useDispatch();
  const isStaff = useSelector(isStaffSelector);

  const callback = () => {
    dispatch(
      openModalDialog(MoveProjectDialog, {
        resolve: { project },
      }),
    );
  };

  return (
    <ActionItem
      title={translate('Move project')}
      action={callback}
      disabled={!isStaff}
    />
  );
};
