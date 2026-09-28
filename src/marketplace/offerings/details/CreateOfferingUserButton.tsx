import { PlusCircleIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

const CreateOfferingUserDialog = lazyComponent(() =>
  import('./CreateOfferingUserDialog').then((module) => ({
    default: module.CreateOfferingUserDialog,
  })),
);

export const CreateOfferingUserButton = ({ offering, onSuccess }) => {
  const { openDialog } = useModal();
  const user = useUser();
  if (!offering.plugin_options?.service_provider_can_create_offering_user) {
    return null;
  }
  if (
    !hasPermission(user, {
      permission: PermissionEnum.CREATE_OFFERING_USER,
      customerId: offering.customer_uuid,
    })
  ) {
    return null;
  }
  return (
    <BaseButton
      label={translate('Create')}
      iconNode={<PlusCircleIcon weight="bold" />}
      onClick={() =>
        openDialog(CreateOfferingUserDialog, {
          resolve: { offering, onSuccess },
        })
      }
      variant="tertiary"
      size="lg"
    />
  );
};
