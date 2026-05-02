import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';

const ProjectCreateDialog = lazyComponent(() =>
  import('./ProjectCreateDialog').then((module) => ({
    default: module.ProjectCreateDialog,
  })),
);

export const GlobalProjectCreateButton: FC<{ refetch }> = ({ refetch }) => {
  const user = useUser();
  const disabled =
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
  if (disabled) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Add')}
      action={() =>
        openDialog(ProjectCreateDialog, {
          size: 'lg',
          formId: 'projectCreate',
          refetch,
        })
      }
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  );
};
