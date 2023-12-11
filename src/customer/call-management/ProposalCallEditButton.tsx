import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const ProposalCallEditDialog = lazyComponent(
  () => import('./ProposalCallFormDialog'),
  'ProposalCallFormDialog',
);

const callEditDialog = (row, refetch) =>
  openModalDialog(ProposalCallEditDialog, {
    resolve: { call: row, refetch },
    size: 'md',
  });

export const ProposalCallEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () => dispatch(callEditDialog(row, refetch)),
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
