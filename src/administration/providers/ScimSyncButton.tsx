import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { usersScimSyncAll } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

export const ScimSyncButton = () => {
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);

  const handleSync = useCallback(async () => {
    setPending(true);
    try {
      await usersScimSyncAll();
      dispatch(
        showSuccess(translate('SCIM user synchronization has been scheduled.')),
      );
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to schedule SCIM user synchronization.'),
        ),
      );
    } finally {
      setPending(false);
    }
  }, [dispatch]);

  return (
    <ActionButton
      action={handleSync}
      variant="primary"
      pending={pending}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      title={translate('Sync all users')}
    />
  );
};
