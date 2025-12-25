import { FC } from 'react';
import { ChecklistCategory } from 'waldur-js-client';

import { EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const CategoryFormDialog = lazyComponent(() =>
  import('./CategoryFormDialog').then((module) => ({
    default: module.CategoryFormDialog,
  })),
);

interface CategoryEditActionProps {
  row: ChecklistCategory;
  refetch(): void;
}

export const CategoryEditAction: FC<CategoryEditActionProps> = ({
  row,
  refetch,
}) => (
  <EditModalButton
    dialog={CategoryFormDialog}
    row={row}
    buildResolve={(r) => ({ refetch, categoryUuid: r.uuid })}
    getInitialValues={(r) => ({ name: r.name, description: r.description })}
    size="sm"
  />
);
