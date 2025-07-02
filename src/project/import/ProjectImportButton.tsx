import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

const ProjectImportDialog = lazyComponent(() =>
  import('./ProjectImportDialog').then((module) => ({
    default: module.ProjectImportDialog,
  })),
);

interface ProjectImportButtonProps {
  customer?: Customer;
  refetch?;
}

export const ProjectImportButton: FC<ProjectImportButtonProps> = ({
  customer,
  refetch,
}) => {
  const user = useSelector(getUser);
  const disabled =
    customer &&
    !hasPermission(user, {
      permission: PermissionEnum.CREATE_PROJECT,
      customerId: customer.uuid,
    });
  const hasNoPermission =
    !customer &&
    !user.is_staff &&
    user.permissions
      .filter((perm) => perm.scope_type === 'customer')
      .every(
        (perm) =>
          !hasPermission(user, {
            permission: PermissionEnum.CREATE_PROJECT,
            customerId: perm.scope_uuid,
          }),
      );
  const dispatch = useDispatch();

  return (
    <ActionButton
      title={translate('Bulk import')}
      action={() =>
        dispatch(
          openModalDialog(ProjectImportDialog, {
            size: 'lg',
            formId: 'BulkImportProjects',
            resolve: {
              customer,
              refetch,
            },
          }),
        )
      }
      tooltip={
        disabled || hasNoPermission
          ? translate(
              "You don't have enough privileges to perform this operation.",
            )
          : undefined
      }
      iconNode={<DownloadSimpleIcon weight="bold" />}
      disabled={disabled || hasNoPermission}
    />
  );
};
