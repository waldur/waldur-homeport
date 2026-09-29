import { PlusCircleIcon } from '@phosphor-icons/react';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser, useCustomer } from '@/workspace/hooks';

const OfferingCreateDialog = lazyComponent(() =>
  import('../actions/OfferingCreateDialog').then((module) => ({
    default: module.OfferingCreateDialog,
  })),
);

const useCreateOffering = (fetch?, showProvider = false) => {
  const { openDialog } = useModal();
  const customer = useCustomer();
  const user = useUser();

  const canCreate =
    user.is_staff ||
    (customer?.is_service_provider &&
      hasPermission(user, {
        permission: PermissionEnum.CREATE_OFFERING,
        customerId: customer.uuid,
      }));

  const openCreateDialog = () =>
    openDialog(OfferingCreateDialog, {
      resolve: { fetch, showProvider },
    });

  return { canCreate, openCreateDialog };
};

export const CreateOfferingButton = ({
  fetch,
  className,
  showProvider = false,
}: {
  fetch?;
  className?;
  showProvider?: boolean;
}) => {
  const { canCreate, openCreateDialog } = useCreateOffering(
    fetch,
    showProvider,
  );

  if (canCreate) {
    return (
      <AddButton
        action={openCreateDialog}
        className={className}
        data-testid="offering-add-btn"
      />
    );
  } else {
    return null;
  }
};

// The same action as an item of the list's Actions menu.
export const CreateOfferingAction = ({
  fetch,
  showProvider = false,
}: {
  fetch?;
  showProvider?: boolean;
}) => {
  const { canCreate, openCreateDialog } = useCreateOffering(
    fetch,
    showProvider,
  );
  return canCreate ? (
    <ActionItem
      title={translate('Add offering')}
      action={openCreateDialog}
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  ) : null;
};
