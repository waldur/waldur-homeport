import * as React from 'react';
import * as ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { connect } from 'react-redux';

import { PaymentUpdateDialogContainer } from '@waldur/customer/payments/PaymentUpdateDialog';
import { deletePayment } from '@waldur/customer/payments/store/actions';
import { translate } from '@waldur/i18n';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { Payment } from '@waldur/workspace/types';

const openDialog = async (dispatch, payment: Payment) => {
  try {
    await waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate('Are you sure you want to delete the payment?'),
    );
  } catch {
    return;
  }
  dispatch(deletePayment(payment.uuid));
};

const openPaymentUpdateDialog = (payment: Payment) =>
  openModalDialog(PaymentUpdateDialogContainer, {
    resolve: payment,
    size: 'lg',
  });

const Actions = (props) => (
  <ButtonGroup>
    <ActionButton
      title={translate('Edit')}
      action={() => props.openUpdateDialog(props.payment)}
      icon="fa fa-edit"
      {...props.tooltipAndDisabledAttributes}
    />
    <ActionButton
      title={translate('Delete')}
      action={() => props.openConfirmationDialog(props.payment)}
      icon="fa fa-trash"
      {...props.tooltipAndDisabledAttributes}
    />
  </ButtonGroup>
);

const mapDispatchToProps = (dispatch) => ({
  openConfirmationDialog: (payment: Payment) => openDialog(dispatch, payment),
  openUpdateDialog: (payment: Payment) =>
    dispatch(openPaymentUpdateDialog(payment)),
});

const enhance = connect(null, mapDispatchToProps);

export const PaymentActions = enhance(Actions);
