import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser, useCustomer } from '@/workspace/hooks';

const CallCreateDialog = lazyComponent(() =>
  import('./CallFormDialog').then((module) => ({
    default: module.CallFormDialog,
  })),
);

export const CallCreateButton = ({ refetch }) => {
  const user = useUser();
  const customer = useCustomer();
  const canCreateCall = hasPermission(user, {
    permission: PermissionEnum.CREATE_CALL,
    callOrganizerId: customer?.call_managing_organization_uuid,
  });
  const { openDialog } = useModal();

  // A call belongs to a managing organisation, so there is nothing to create
  // from a cross-organisation list. The organisation's own Call management tab
  // is where a call is started.
  if (!customer || !canCreateCall) {
    return null;
  }

  return (
    <AddButton
      action={() =>
        openDialog(CallCreateDialog, {
          resolve: { refetch },
          size: 'lg',
        })
      }
    />
  );
};
