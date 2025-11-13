import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { ApproveManagedProjectButton } from './ApproveManagedProjectButton';
import { AttachManagedProjectButton } from './AttachManagedProjectButton';
import { DeleteManagedProjectButton } from './DeleteManagedProjectButton';
import { DetachManagedProjectButton } from './DetachManagedProjectButton';
import { RejectManagedProjectButton } from './RejectManagedProjectButton';

export const ManagedProjectActions = ({ project, refetch }) => {
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
        DeleteManagedProjectButton,
      ].filter(Boolean)}
      data-cy="public-resources-list-actions-dropdown-btn"
    />
  );
};
