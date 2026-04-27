import { ActionsDropdown } from '@/table/ActionsDropdown';

import { GroupDeleteButton } from './GroupDeleteButton';
import { GroupEditButton } from './GroupEditButton';

export const CategoryGroupsRowActions = ({ row, refetch }) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[GroupEditButton, GroupDeleteButton].filter(Boolean)}
  />
);
