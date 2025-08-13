import { FC, useCallback } from 'react';
import { ChecklistCategory } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { useModal } from '@waldur/modal/hooks';

interface CategoryEditActionProps {
  row: ChecklistCategory;
  refetch(): void;
}

export const CategoryEditAction: FC<CategoryEditActionProps> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  const callback = useCallback(() => {
    openDialog(
      lazyComponent(() =>
        import('./CategoryFormDialog').then((module) => ({
          default: module.CategoryFormDialog,
        })),
      ),
      {
        resolve: { refetch, categoryUuid: row.uuid },
        initialValues: { name: row.name, description: row.description },
        size: 'sm',
      },
    );
  }, [refetch]);

  return <EditAction action={callback} />;
};
