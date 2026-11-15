import { ActionsDropdown } from '@/table/ActionsDropdown';

import { ConnectedAppRevokeButton } from './ConnectedAppRevokeButton';

export const ConnectedAppActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[ConnectedAppRevokeButton]}
  />
);
