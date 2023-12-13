import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const ProposalCallCreateDialog = lazyComponent(
  () => import('./ProposalCallFormDialog'),
  'ProposalCallFormDialog',
);

const callCreateDialog = (refetch) =>
  openModalDialog(ProposalCallCreateDialog, {
    resolve: { refetch },
    size: 'md',
  });

export const ProposalCallCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () => dispatch(callCreateDialog(refetch)),
    [dispatch],
  );

  return (
    <ActionButton
      title={translate('Add call')}
      action={openFormDialog}
      icon="fa fa-plus"
      variant="primary"
    />
  );
};
