import { ActionsDropdown } from '@/table/ActionsDropdown';

import { CategoryDeleteAction } from './CategoryDeleteAction';
import { CategoryEditAction } from './CategoryEditAction';
import { CategoryManageColumns } from './CategoryManageColumns';
import { CategoryAddSectionAction } from './structure/CategoryStructurePanel';

export const CategoryRowActions = ({ row, refetch }) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[
      CategoryEditAction,
      CategoryAddSectionAction,
      CategoryManageColumns,
      CategoryDeleteAction,
    ].filter(Boolean)}
  />
);
