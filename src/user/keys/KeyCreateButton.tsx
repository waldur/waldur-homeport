import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n/translate';
import { ActionButton } from '@waldur/table/ActionButton';

import { keyCreateDialog } from './actions';

export const KeyCreateButton: FunctionComponent = () => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(() => dispatch(keyCreateDialog()), []);

  return (
    <ActionButton
      title={translate('Add key')}
      action={openFormDialog}
      icon="fa fa-plus"
    />
  );
};
