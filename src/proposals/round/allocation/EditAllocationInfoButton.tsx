import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { EditRoundAllocationDialog } from './EditRoundAllocationDialog';

export const EditAllocationInfoButton = ({ round, call, refetch }) => {
  const dispatch = useDispatch();
  const callback = useCallback(
    () =>
      dispatch(
        openModalDialog(EditRoundAllocationDialog, {
          resolve: { round, call, refetch },
          size: 'lg',
        }),
      ),
    [dispatch, round],
  );

  return (
    <ActionButton
      action={callback}
      title={translate('Edit')}
      icon="fa fa-pencil"
    />
  );
};