import { PencilSimple } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

const CategoryEditDialog = lazyComponent(
  () => import('./CategoryEditDialog'),
  'CategoryEditDialog',
);

export const CategoryEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(CategoryEditDialog, {
          resolve: { category: row, refetch },
          size: 'md',
        }),
      ),
    [dispatch],
  );

  return (
    <RowActionButton
      title={translate('Edit')}
      action={openFormDialog}
      iconNode={<PencilSimple />}
      size="sm"
    />
  );
};
