import { ActionsDropdown } from '@/table/ActionsDropdown';

import { RoleCompareButton } from './RoleCompareButton';
import { RoleDeleteButton } from './RoleDeleteButton';
import { RoleDescriptionEditButton } from './RoleDescriptionEditButton';
import { RoleEditButton } from './RoleEditButton';
import { RoleToggleButton } from './RoleToggleButton';

export const RoleActions = ({ row, refetch }) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[
      RoleCompareButton,
      RoleEditButton,
      RoleDescriptionEditButton,
      RoleToggleButton,
      !row.is_system_role ? RoleDeleteButton : null,
    ].filter(Boolean)}
  />
);
