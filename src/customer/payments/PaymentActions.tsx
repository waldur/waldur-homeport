import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import { connect } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { LinkInvoiceAction } from '@waldur/customer/payments/LinkInvoiceAction';
import {
  deletePayment,
  linkInvoice,
  unlinkInvoice,
} from '@waldur/customer/payments/store/actions';
import { translate } from '@waldur/i18n';
import { Invoice } from '@waldur/invoices/types';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { Payment } from '@waldur/workspace/types';

const PaymentUpdateDialogContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "PaymentUpdateDialog" */ '@waldur/customer/payments/PaymentUpdateDialog'
    ),
  'PaymentUpdateDialogContainer',
);

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

const Actions: FunctionComponent<any> = (props) => (
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
    {!props.payment.invoice ? (
      <LinkInvoiceAction
        onInvoiceSelect={(invoice) => props.linkInvoice(props.payment, invoice)}
        {...props.tooltipAndDisabledAttributes}
      />
    ) : (
      <ActionButton
        title={translate('Unlink invoice')}
        action={() => props.unlinkInvoice(props.payment)}
        icon="fa fa-file-text-o"
        {...props.tooltipAndDisabledAttributes}
      />
    )}
  </ButtonGroup>
);

const mapDispatchToProps = (dispatch) => ({
  openConfirmationDialog: (payment: Payment) => openDialog(dispatch, payment),
  openUpdateDialog: (payment: Payment) =>
    dispatch(openPaymentUpdateDialog(payment)),
  linkInvoice: (payment: Payment, invoice: Invoice) =>
    dispatch(linkInvoice(payment.uuid, invoice.url)),
  unlinkInvoice: (payment: Payment) => dispatch(unlinkInvoice(payment.uuid)),
});

const enhance = connect(null, mapDispatchToProps);

export const PaymentActions = enhance(Actions);
