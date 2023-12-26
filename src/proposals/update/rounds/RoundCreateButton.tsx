import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n/translate';
import { ActionButton } from '@waldur/table/ActionButton';

export const RoundCreateButton = () => {
  const dispatch = useDispatch();
  const openRoundCreateDialog = useCallback(() => {
    // ignore
  }, [dispatch]);

  return (
    <ActionButton
      title={translate('New round')}
      icon="fa fa-plus"
      action={openRoundCreateDialog}
      variant="light"
    />
  );
};
