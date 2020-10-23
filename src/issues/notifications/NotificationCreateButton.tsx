import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { NotificationCreateDialog } from './NotificationCreateDialog';

export const NotificationCreateButton = () => {
  const dispatch = useDispatch();
  const callback = () => dispatch(openModalDialog(NotificationCreateDialog));
  return (
    <ActionButton
      action={callback}
      title={translate('Create')}
      icon="fa fa-plus"
    />
  );
};
