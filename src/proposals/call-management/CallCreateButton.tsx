import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const CallCreateDialog = lazyComponent(
  () => import('./CallFormDialog'),
  'CallFormDialog',
);

const callCreateDialog = (refetch) =>
  openModalDialog(CallCreateDialog, {
    resolve: { refetch },
    size: 'md',
  });

export const CallCreateButton = ({ refetch }) => {
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
