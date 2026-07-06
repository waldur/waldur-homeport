import { PosixIdPool } from 'waldur-js-client';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

const PosixIdPoolFormDialog = lazyComponent(() =>
  import('./PosixIdPoolFormDialog').then((module) => ({
    default: module.PosixIdPoolFormDialog,
  })),
);

interface PosixIdPoolEditButtonProps {
  row: PosixIdPool;
  refetch: () => void;
}

export const PosixIdPoolEditButton = ({
  row,
  refetch,
}: PosixIdPoolEditButtonProps) => {
  const user = useUser();
  if (
    !hasPermission(user, {
      permission: PermissionEnum.MANAGE_POSIX_ID_POOL,
      customerId: row.customer_uuid,
    })
  ) {
    return null;
  }
  return (
    <EditModalButton
      dialog={PosixIdPoolFormDialog}
      row={row}
      buildResolve={(r) => ({ pool: r, refetch })}
      size="lg"
    />
  );
};
