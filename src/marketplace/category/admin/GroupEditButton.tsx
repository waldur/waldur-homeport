import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const GroupEditDialog = lazyComponent(
  () => import('./GroupFromDialog'),
  'GroupFromDialog',
);

const groupEditDialog = (row, refetch) =>
  openModalDialog(GroupEditDialog, {
    resolve: { categoryGroup: row, refetch },
    size: 'md',
  });

export const GroupEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () => dispatch(groupEditDialog(row, refetch)),
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
