import { PlusCircle } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const GroupCreateDialog = lazyComponent(
  () => import('./GroupFromDialog'),
  'GroupFromDialog',
);

const groupCreateDialog = (refetch) =>
  openModalDialog(GroupCreateDialog, { resolve: { refetch }, size: 'md' });

export const GroupCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () => dispatch(groupCreateDialog(refetch)),
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
