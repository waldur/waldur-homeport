import { Trash } from '@phosphor-icons/react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import { removeKey } from './api';

const KeyRemoveDialog = lazyComponent(
  () => import('./KeyRemoveDialog'),
  'KeyRemoveDialog',
);

export const KeyRemoveButton = ({ uuid, refetch }) => {
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);

  const action = async () => {
    try {
      setPending(true);
      await removeKey(uuid);
      await refetch();
      dispatch(showSuccess(translate('SSH key has been removed.')));
    } catch (e) {
      dispatch(showError(translate('Unable to remove SSH key.')));
    }
    setPending(false);
  };

  return (
    <ActionButton
      title={translate('Remove')}
      action={() =>
        dispatch(
          openModalDialog(KeyRemoveDialog, { resolve: { action }, size: 'md' }),
        )
      }
      pending={pending}
      iconNode={<Trash />}
      disabled={pending}
    />
  );
};
