import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { CategoryDeleteAction } from './CategoryDeleteAction';
import { CategoryEditAction } from './CategoryEditAction';

export const CategoryRowActions = ({ row, fetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[CategoryEditAction, CategoryDeleteAction]}
    />
  );
};
