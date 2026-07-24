import { ActionsDropdown } from '@/table/ActionsDropdown';

import { SupportUserDeleteButton } from './SupportUserDeleteButton';
import { SupportUserEditButton } from './SupportUserEditButton';
import { SupportUserMergeButton } from './SupportUserMergeButton';
import { SupportUserToggleButton } from './SupportUserToggleButton';

export const SupportUserActions = ({ row, refetch }) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[
      SupportUserEditButton,
      SupportUserToggleButton,
      SupportUserMergeButton,
      SupportUserDeleteButton,
    ]}
  />
);
