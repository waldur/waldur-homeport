import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Invoice } from '@waldur/invoices/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

const MarkAsPaidDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "MarkAsPaidDialog" */ '@waldur/invoices/list/MarkAsPaidDialog'
    ),
  'MarkAsPaidDialog',
);

const openMarkAsPaidDialog = (invoice: Invoice) =>
  openModalDialog(MarkAsPaidDialog, {
    resolve: invoice,
    size: 'lg',
  });

export const MarkAsPaidButton: FunctionComponent<{ row }> = ({ row }) => {
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
