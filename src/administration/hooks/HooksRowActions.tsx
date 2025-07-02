import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { HookRemoveButton } from '@waldur/user/hooks/HookRemoveButton';

import { HookUpdateButton } from './HookUpdateButton';

export const HooksRowActions = ({ row, refetch }) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[HookUpdateButton, HookRemoveButton].filter(Boolean)}
  />
);
