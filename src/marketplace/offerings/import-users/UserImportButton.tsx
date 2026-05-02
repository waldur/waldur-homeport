import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { ServiceProvider } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';

const UserImportDialog = lazyComponent(() =>
  import('./UserImportDialog').then((module) => ({
    default: module.UserImportDialog,
  })),
);

interface UserImportButtonProps {
  provider?: ServiceProvider;
  refetch?;
}

export const UserImportButton: FC<UserImportButtonProps> = ({
  provider,
  refetch,
}) => {
  const user = useUser();
  const { openDialog } = useModal();

  const canCreateOfferingUser = hasPermission(user, {
    permission: PermissionEnum.CREATE_OFFERING_USER,
    customerId: provider?.customer_uuid,
  });

  return (
    <ActionButton
      title={translate('Bulk import')}
      action={() =>
        openDialog(UserImportDialog, {
          size: 'lg',
          formId: 'BulkImportOfferingUsers',
          resolve: { provider, refetch },
        })
      }
      iconNode={<DownloadSimpleIcon weight="bold" />}
      disabled={!canCreateOfferingUser}
      tooltip={
        !canCreateOfferingUser &&
        translate('You do not have permission to perform this action.')
      }
    />
  );
};
