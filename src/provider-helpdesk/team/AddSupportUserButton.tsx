import { FC } from 'react';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

const SupportUserDialog = lazyComponent(() =>
  import('./SupportUserDialog').then((module) => ({
    default: module.SupportUserDialog,
  })),
);

export const AddSupportUserButton: FC<{
  helpdeskUuid: string;
  refetch: () => void;
}> = ({ helpdeskUuid, refetch }) => {
  const { openDialog } = useModal();
  // Adding team members is staff-only (backend create is is_staff-gated).
  const user = useUser();
  if (!user?.is_staff) {
    return null;
  }
  return (
    <AddButton
      action={() =>
        openDialog(SupportUserDialog, { resolve: { helpdeskUuid, refetch } })
      }
    />
  );
};
