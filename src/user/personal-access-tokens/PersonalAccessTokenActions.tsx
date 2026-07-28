import { ActionsDropdown } from '@/table/ActionsDropdown';

import { PersonalAccessTokenNetworkAclButton } from './PersonalAccessTokenNetworkAclButton';
import { PersonalAccessTokenRevokeButton } from './PersonalAccessTokenRevokeButton';
import { PersonalAccessTokenRotateButton } from './PersonalAccessTokenRotateButton';

export const PersonalAccessTokenActions = ({ row, fetch }) =>
  row.is_active ? (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        PersonalAccessTokenRotateButton,
        PersonalAccessTokenNetworkAclButton,
        PersonalAccessTokenRevokeButton,
      ]}
    />
  ) : null;
