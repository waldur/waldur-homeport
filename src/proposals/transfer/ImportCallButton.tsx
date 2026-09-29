import { UploadSimpleIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useCustomer, useUser } from '@/workspace/hooks';

const ImportCallDialog = lazyComponent(() =>
  import('./ImportCallDialog').then((module) => ({
    default: module.ImportCallDialog,
  })),
);

export const ImportCallButton = ({ refetch }) => {
  const user = useUser();
  const customer = useCustomer();
  const { openDialog } = useModal();
  const managerUuid = customer?.call_managing_organization_uuid;
  const canCreateCall = hasPermission(user, {
    permission: PermissionEnum.CREATE_CALL,
    callOrganizerId: managerUuid,
  });

  // Same rule as creating a call: an import lands in the organisation whose
  // Call management tab this is, so there is nothing to offer elsewhere.
  if (!customer || !managerUuid || !canCreateCall) {
    return null;
  }

  return (
    <BaseButton
      variant="tertiary"
      label={translate('Import call')}
      iconNode={<UploadSimpleIcon weight="bold" />}
      onClick={() =>
        openDialog(ImportCallDialog, {
          resolve: { managerUuid, refetch },
          size: 'lg',
        })
      }
    />
  );
};
