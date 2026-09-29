import { PlusCircleIcon } from '@phosphor-icons/react';
import { OfferingGroup } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

const OfferingGroupAddOfferingDialog = lazyComponent(() =>
  import('./OfferingGroupAddOfferingDialog').then((module) => ({
    default: module.OfferingGroupAddOfferingDialog,
  })),
);

interface OfferingGroupAddOfferingActionProps {
  row: OfferingGroup;
  refetch: () => void;
}

export const OfferingGroupAddOfferingAction = ({
  row,
  refetch,
}: OfferingGroupAddOfferingActionProps) => {
  const user = useUser();
  const { openDialog } = useModal();

  // Same check as SetOfferingGroupAction: assigning a group updates the
  // offering, not the group.
  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_OFFERING,
      customerId: row.customer_uuid,
    })
  ) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Add offering')}
      action={() =>
        openDialog(OfferingGroupAddOfferingDialog, {
          resolve: { group: row, refetch },
        })
      }
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};
