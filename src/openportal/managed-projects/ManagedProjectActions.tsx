import { useMemo } from 'react';

import { ActionsDropdown } from '@/table/ActionsDropdown';

import { ApproveManagedProjectButton } from './ApproveManagedProjectButton';
import { AttachManagedProjectButton } from './AttachManagedProjectButton';
import { DeleteManagedProjectButton } from './DeleteManagedProjectButton';
import { DetachManagedProjectButton } from './DetachManagedProjectButton';
import { RejectManagedProjectButton } from './RejectManagedProjectButton';

interface ManagedProjectActionsProps {
  project;
  refetch;
  /**
   * Called after a delete instead of refetch. A page that shows one managed
   * project passes this to leave it: refetching a deleted project only fails.
   */
  onDeleted?(): void;
}

export const ManagedProjectActions = ({
  project,
  refetch,
  onDeleted,
}: ManagedProjectActionsProps) => {
  const DeleteAction = useMemo(
    () =>
      onDeleted
        ? ({ row }) => (
            <DeleteManagedProjectButton row={row} refetch={onDeleted} />
          )
        : DeleteManagedProjectButton,
    [onDeleted],
  );

  if (!project) {
    return null;
  }

  return (
    <ActionsDropdown
      row={project}
      refetch={refetch}
      actions={[
        project.state !== 'approved' ? ApproveManagedProjectButton : null,
        project.state !== 'rejected' ? RejectManagedProjectButton : null,
        project.project ? null : AttachManagedProjectButton,
        project.project ? DetachManagedProjectButton : null,
        DeleteAction,
      ].filter(Boolean)}
    />
  );
};
