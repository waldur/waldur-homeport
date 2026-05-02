import { useSelector } from 'react-redux';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

const CallCreateDialog = lazyComponent(() =>
  import('./CallFormDialog').then((module) => ({
    default: module.CallFormDialog,
  })),
);

export const CallCreateButton = ({ refetch }) => {
  const user = useUser();
  const customer = useSelector(getCustomer);
  const canCreateCall = hasPermission(user, {
    permission: PermissionEnum.CREATE_CALL,
    callOrganizerId: customer.call_managing_organization_uuid,
  });
  const { openDialog } = useModal();

  if (!canCreateCall) {
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
