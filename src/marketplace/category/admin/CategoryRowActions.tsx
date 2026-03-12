import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { CategoryDeleteAction } from './CategoryDeleteAction';
import { CategoryEditAction } from './CategoryEditAction';
import { CategoryManageColumns } from './CategoryManageColumns';

export const CategoryRowActions = ({ row, refetch }) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[
      CategoryEditAction,
      CategoryDeleteAction,
      CategoryManageColumns,
    ].filter(Boolean)}
  />
);
