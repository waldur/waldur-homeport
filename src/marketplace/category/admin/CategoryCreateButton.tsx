import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const CategoryCreateDialog = lazyComponent(() =>
  import('./CategoryEditDialog').then((module) => ({
    default: module.CategoryEditDialog,
  })),
);

export const CategoryCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();
  return (
    <AddButton
      action={() =>
        dispatch(
          openModalDialog(CategoryCreateDialog, {
            resolve: { refetch },
            size: 'lg',
          }),
        )
      }
    />
  );
};
