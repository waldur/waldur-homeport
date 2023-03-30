import { FunctionComponent, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n/translate';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

import { keyCreateDialog } from './actions';

export const KeyCreateButton: FunctionComponent = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const openFormDialog = useCallback(() => {
    if (user.registration_method === 'eduteams') {
      document.location =
        'https://mms.myaccessid.org/fed-apps/profile/#settings_sshkeys';
    } else {
      dispatch(keyCreateDialog());
    }
  }, [user, dispatch]);

  return (
    <ActionButton
      title={translate('Add key')}
      tooltip={
        user.registration_method === 'eduteams'
          ? translate('SSH keys are managed externally via MyAccessID.')
          : undefined
      }
      action={openFormDialog}
      icon="fa fa-plus"
      variant="primary"
    />
  );
};
