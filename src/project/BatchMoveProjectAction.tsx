import { ArrowsOutCardinalIcon } from '@phosphor-icons/react';
import { useSelector, useDispatch } from 'react-redux';
import { Project } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import {
  hasPermission,
  hasPermissionOnAnyCustomer,
} from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { useUser } from '@waldur/workspace/hooks';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

const BatchMoveProjectDialog = lazyComponent(() =>
  import('./BatchMoveProjectDialog').then((module) => ({
    default: module.BatchMoveProjectDialog,
  })),
);

export const BatchMoveProjectAction = ({
  rows,
  refetch,
}: {
  rows: Project[];
  refetch;
}) => {
  const dispatch = useDispatch();
  const user = useUser();
  const isStaff = useSelector(isStaffSelector);

  // Check source: user has CREATE_PROJECT on all selected projects' orgs
  const hasSourcePermission = rows.every(
    (project) =>
      isStaff ||
      hasPermission(user, {
        permission: PermissionEnum.CREATE_PROJECT,
        customerId: project.customer_uuid,
      }),
  );

  // Check target: user has CREATE_PROJECT on at least one org to move to
  const hasTargetPermission = hasPermissionOnAnyCustomer(
    user,
    PermissionEnum.CREATE_PROJECT,
  );

  if (!isStaff && (!hasSourcePermission || !hasTargetPermission)) {
    return null;
  }

  const callback = () =>
    dispatch(
      openModalDialog(BatchMoveProjectDialog, {
        resolve: { rows, refetch },
      }),
    );

  return (
    <ActionItem
      title={translate('Move to organization')}
      action={callback}
      iconNode={<ArrowsOutCardinalIcon weight="bold" />}
    />
  );
};
