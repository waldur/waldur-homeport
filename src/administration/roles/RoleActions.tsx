import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { RoleDeleteButton } from './RoleDeleteButton';
import { RoleDescriptionEditButton } from './RoleDescriptionEditButton';
import { RoleEditButton } from './RoleEditButton';
import { RoleToggleButton } from './RoleToggleButton';

export const RoleActions = ({ row, refetch }) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[
      RoleEditButton,
      RoleDescriptionEditButton,
      RoleToggleButton,
      !row.is_system_role ? RoleDeleteButton : null,
    ].filter(Boolean)}
    data-cy="public-resources-list-actions-dropdown-btn"
  />
);
