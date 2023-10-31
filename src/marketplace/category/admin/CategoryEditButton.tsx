import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const CategoryEditDialog = lazyComponent(
  () => import('./CategoryFromDialog'),
  'CategoryFromDialog',
);

const categoryEditDialog = (row, refetch) =>
  openModalDialog(CategoryEditDialog, {
    resolve: { category: row, refetch },
    size: 'md',
  });

export const CategoryEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () => dispatch(categoryEditDialog(row, refetch)),
    [dispatch],
  );

  return (
    <ActionButton
      title={translate('Edit')}
      action={openFormDialog}
      icon="fa fa-edit"
      variant="primary"
    />
  );
};
