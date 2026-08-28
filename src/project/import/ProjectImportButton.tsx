import { UploadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

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
  const user = useUser();
  if (!user) return null;
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
  const { openDialog } = useModal();

  if (disabled || hasNoPermission) {
    return null;
  }

  return (
    <ActionButton
      title={translate('Bulk import')}
      action={() =>
        openDialog(ProjectImportDialog, {
          size: 'lg',
          formId: 'BulkImportProjects',
          resolve: {
            customer,
            refetch,
          },
        })
      }
      iconNode={<UploadSimpleIcon weight="bold" />}
    />
  );
};
