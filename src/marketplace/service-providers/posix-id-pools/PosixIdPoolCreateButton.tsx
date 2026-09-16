import { PosixIdPool } from 'waldur-js-client';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

const PosixIdPoolFormDialog = lazyComponent(() =>
  import('./PosixIdPoolFormDialog').then((module) => ({
    default: module.PosixIdPoolFormDialog,
  })),
);

interface PosixIdPoolCreateButtonProps {
  providerUuid: string;
  customerUuid: string;
  /** The pools listed alongside, so the dialog can keep ranges apart. */
  pools?: PosixIdPool[];
  refetch: () => void;
}

export const PosixIdPoolCreateButton = ({
  providerUuid,
  customerUuid,
  pools,
  refetch,
}: PosixIdPoolCreateButtonProps) => {
  const user = useUser();
  if (
    !hasPermission(user, {
      permission: PermissionEnum.MANAGE_POSIX_ID_POOL,
      customerId: customerUuid,
    })
  ) {
    return null;
  }
  return (
    <CreateModalButton
      dialog={PosixIdPoolFormDialog}
      resolve={{ providerUuid, customerUuid, pools, refetch }}
      size="lg"
    />
  );
};
