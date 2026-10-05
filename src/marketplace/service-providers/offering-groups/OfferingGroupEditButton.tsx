import { OfferingGroup } from 'waldur-js-client';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

const OfferingGroupFormDialog = lazyComponent(() =>
  import('./OfferingGroupFormDialog').then((module) => ({
    default: module.OfferingGroupFormDialog,
  })),
);

interface OfferingGroupEditButtonProps {
  row: OfferingGroup;
  refetch: () => void;
  customerUrl?: string;
}

export const OfferingGroupEditButton = ({
  row,
  refetch,
  customerUrl,
}: OfferingGroupEditButtonProps) => {
  const user = useUser();
  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_OFFERING,
      customerId: row.customer_uuid,
    })
  ) {
    return null;
  }
  return (
    <EditModalButton
      dialog={OfferingGroupFormDialog}
      row={row}
      buildResolve={(r) => ({ group: r, customerUrl, refetch })}
      size="lg"
    />
  );
};
