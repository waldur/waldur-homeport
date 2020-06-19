import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { post } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import { ActionButton } from '@waldur/table-react/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

export const MarkAsPaidButton = ({ row }) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  if (!user.is_staff) {
    return null;
  }

  const onClick = async () => {
    try {
      await post(`/invoices/${row.uuid}/paid/`);
      dispatch(showSuccess(translate('The invoice has been marked as paid.')));
    } catch (e) {
      dispatch(showError(translate('Unable to mark the invoice as paid.')));
    }
  };

  return (
    <ActionButton
      title={translate('Mark as paid')}
      disabled={row.state !== 'created'}
      icon="fa fa-money"
      tooltip={
        row.state !== 'created'
          ? translate('Only a created invoice can be marked as paid.')
          : ''
      }
      action={onClick}
    />
  );
};
