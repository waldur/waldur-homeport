import { FC } from 'react';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

const CannedResponseDialog = lazyComponent(() =>
  import('./CannedResponseDialog').then((module) => ({
    default: module.CannedResponseDialog,
  })),
);

export const AddCannedResponseButton: FC<{
  helpdeskUuid: string;
  refetch: () => void;
}> = ({ helpdeskUuid, refetch }) => {
  const { openDialog } = useModal();
  // Creating canned responses is staff-only (backend create is is_staff-gated).
  const user = useUser();
  if (!user?.is_staff) {
    return null;
  }
  return (
    <AddButton
      action={() =>
        openDialog(CannedResponseDialog, { resolve: { helpdeskUuid, refetch } })
      }
    />
  );
};
