import { PencilSimple } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

const AccessSubnetEditDialog = lazyComponent(
  () => import('./AccessSubnetEditDialog'),
  'AccessSubnetEditDialog',
);

export const AccessSubnetEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(AccessSubnetEditDialog, {
          refetch: refetch,
          row: row,
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
