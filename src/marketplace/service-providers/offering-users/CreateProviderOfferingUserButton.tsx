import { PlusCircleIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

const CreateProviderOfferingUserDialog = lazyComponent(() =>
  import('./CreateProviderOfferingUserDialog').then((module) => ({
    default: module.CreateProviderOfferingUserDialog,
  })),
);

export const CreateProviderOfferingUserButton = ({ refetch, provider }) => {
  const { openDialog } = useModal();
  const user = useUser();
  if (
    !hasPermission(user, {
      permission: PermissionEnum.CREATE_OFFERING_USER,
      customerId: provider?.customer_uuid,
    })
  ) {
    return null;
  }
  return (
    <BaseButton
      label={translate('Create')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      onClick={() =>
        openDialog(CreateProviderOfferingUserDialog, {
          resolve: { refetch, provider },
        })
      }
      size="lg"
    />
  );
};
