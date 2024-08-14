import { PlusCircle } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const CategoryCreateDialog = lazyComponent(
  () => import('./CategoryEditDialog'),
  'CategoryEditDialog',
);

const categoryCreateDialog = (refetch) =>
  openModalDialog(CategoryCreateDialog, { resolve: { refetch }, size: 'md' });

export const CategoryCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () => dispatch(categoryCreateDialog(refetch)),
    [dispatch],
  );

  return (
    <ActionButton
      title={translate('Add')}
      action={openFormDialog}
      iconNode={<PlusCircle />}
      variant="primary"
    />
  );
};
