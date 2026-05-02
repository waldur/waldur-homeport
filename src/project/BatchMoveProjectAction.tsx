import { ArrowsOutCardinalIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';
import { Project } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import {
  hasPermission,
  hasPermissionOnAnyCustomer,
} from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

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
  const { openDialog } = useModal();
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
    openDialog(BatchMoveProjectDialog, {
      resolve: { rows, refetch },
    });

  return (
    <ActionItem
      title={translate('Move to organization')}
      action={callback}
      iconNode={<ArrowsOutCardinalIcon weight="bold" />}
    />
  );
};
