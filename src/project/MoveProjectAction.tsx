import { ArrowsOutCardinalIcon } from '@phosphor-icons/react';
import { useSelector, useDispatch } from 'react-redux';
import { Project } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import {
  hasPermission,
  hasPermissionOnAnyCustomer,
} from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

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
  const hasSourcePermission = hasPermission(user, {
    permission: PermissionEnum.CREATE_PROJECT,
    customerId: project.customer_uuid,
  });
  const hasTargetPermission = hasPermissionOnAnyCustomer(
    user,
    PermissionEnum.CREATE_PROJECT,
  );

  const isDisabled = !isStaff && (!hasSourcePermission || !hasTargetPermission);

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
          ? !hasSourcePermission
            ? translate(
                'You do not have permission to move projects from this organization.',
              )
            : translate(
                'You do not have permission to create projects in any organization.',
              )
          : undefined
      }
      iconNode={<ArrowsOutCardinalIcon weight="bold" />}
    />
  );
};
