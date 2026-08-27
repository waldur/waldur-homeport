import { ActionsDropdown } from '@/table/ActionsDropdown';

import { PasskeyRenameButton } from './PasskeyRenameButton';
import { PasskeyRevokeButton } from './PasskeyRevokeButton';

export const PasskeyActions = ({ row, fetch }) =>
  row.is_active ? (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[PasskeyRenameButton, PasskeyRevokeButton]}
    />
  ) : null;
