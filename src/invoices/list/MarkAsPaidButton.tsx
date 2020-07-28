import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { MarkAsPaidDialog } from '@waldur/invoices/list/MarkAsPaidDialog';
import { Invoice } from '@waldur/invoices/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

const openMarkAsPaidDialog = (invoice: Invoice) =>
  openModalDialog(MarkAsPaidDialog, {
    resolve: invoice,
    size: 'lg',
  });

export const MarkAsPaidButton = ({ row }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  if (!user.is_staff) {
    return null;
  }
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
      action={() => dispatch(openMarkAsPaidDialog(row))}
    />
  );
};
