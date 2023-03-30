import { useRouter } from '@uirouter/react';
import { FunctionComponent, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n/translate';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

export const KeyCreateButton: FunctionComponent = () => {
  const router = useRouter();
  const user = useSelector(getUser);
  const openFormDialog = useCallback(() => {
    if (user.registration_method === 'eduteams') {
      document.location =
        'https://mms.myaccessid.org/fed-apps/profile/#settings_sshkeys';
    } else {
      router.stateService.go('keys.create');
    }
  }, [user, router]);

  return (
    <ActionButton
      title={translate('Add key')}
      action={openFormDialog}
      icon="fa fa-plus"
    />
  );
};
