import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { post } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { showSuccess, showError } from '@waldur/store/coreSaga';
import { ActionButton } from '@waldur/table-react/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

export const SendNotificationButton = ({ row }) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  if (!user.is_staff) {
    return null;
  }

  const onClick = async () => {
    try {
      await post(`/invoices/${row.uuid}/send_notification/`);
      dispatch(
        showSuccess(
          translate(
            'Record notification has been sent to organization owners.',
          ),
        ),
      );
    } catch (e) {
      dispatch(showError(translate('Unable to send record notification.')));
    }
  };

  return (
    <ActionButton
      title={translate('Send notification')}
      disabled={row.state !== 'created'}
      icon="fa fa-envelope-o"
      tooltip={
        row.state !== 'created'
          ? translate('Notification only for the created invoice can be sent.')
          : ''
      }
      action={onClick}
    />
  );
};
