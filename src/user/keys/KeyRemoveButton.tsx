import { TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { keysDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const KeyRemoveButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);

  const action = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Key removal'),
        translate('Are you sure you would like to delete the key?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setPending(true);
      await keysDestroy({ path: { uuid: row.uuid } });
      await refetch();
      dispatch(showSuccess(translate('SSH key has been removed.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to remove SSH key.')));
    }
    setPending(false);
  };

  return (
    <ActionItem
      title={translate('Remove')}
      action={action}
      disabled={pending}
      iconNode={<TrashIcon />}
      className="text-danger"
      iconColor="danger"
    />
  );
};
