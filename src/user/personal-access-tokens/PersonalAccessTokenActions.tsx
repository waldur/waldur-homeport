import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { PersonalAccessTokenRevokeButton } from './PersonalAccessTokenRevokeButton';
import { PersonalAccessTokenRotateButton } from './PersonalAccessTokenRotateButton';

export const PersonalAccessTokenActions = ({ row, fetch }) =>
  row.is_active ? (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        PersonalAccessTokenRotateButton,
        PersonalAccessTokenRevokeButton,
      ]}
    />
  ) : null;
