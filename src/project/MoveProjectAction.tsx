import { ArrowsOutCardinalIcon } from '@phosphor-icons/react';
import { useSelector, useDispatch } from 'react-redux';
import { Project } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { useUser } from '@waldur/workspace/hooks';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

const MoveProjectDialog = lazyComponent(() =>
  import('./MoveProjectDialog').then((module) => ({
    default: module.MoveProjectDialog,
  })),
);

export const MoveProjectAction = ({
  project,
  refetch,
}: {
  project: Project;
  refetch;
}) => {
  const dispatch = useDispatch();
  const user = useUser();
  const isStaff = useSelector(isStaffSelector);
  const hasProjectCreatePermissionInCurrentCustomer = hasPermission(user, {
    permission: PermissionEnum.CREATE_PROJECT,
    customerId: project.customer_uuid,
  });

  const isDisabled = !hasProjectCreatePermissionInCurrentCustomer && !isStaff;

  const callback = () => {
    dispatch(
      openModalDialog(MoveProjectDialog, {
        resolve: { project, refetch },
      }),
    );
  };

  return (
    <ActionItem
      title={translate('Move project')}
      action={callback}
      disabled={isDisabled}
      tooltip={
        isDisabled
          ? translate('You do not have permission to move this project.')
          : undefined
      }
      iconNode={<ArrowsOutCardinalIcon weight="bold" />}
    />
  );
};
