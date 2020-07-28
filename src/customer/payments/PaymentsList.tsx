import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { PAYMENTS_TABLE } from '@waldur/customer/details/constants';
import { PaymentCreateDialogContainer } from '@waldur/customer/payments/PaymentCreateDialog';
import { PaymentInvoiceRenderer } from '@waldur/customer/payments/PaymentInvoiceRenderer';
import { PaymentProofRenderer } from '@waldur/customer/payments/PaymentProofRenderer';
import { translate } from '@waldur/i18n';
import { getActivePaymentProfile } from '@waldur/invoices/details/utils';
import { openModalDialog } from '@waldur/modal/actions';
import { connectTable, createFetcher, Table } from '@waldur/table';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, isStaff, isSupport } from '@waldur/workspace/selectors';

import { PaymentActions } from './PaymentActions';

const openPaymentCreateDialog = (profileUrl: string) =>
  openModalDialog(PaymentCreateDialogContainer, {
    resolve: {
      profileUrl: profileUrl,
    },
    size: 'lg',
  });

export const TableComponent = (props) => {
  const activePaymentProfile = getActivePaymentProfile(
    props.customer.payment_profiles,
  );

  if (!activePaymentProfile) {
    return (
      <p>
        {translate(
          'Please, create and enable a payment profile to be able to manage payments.',
        )}
      </p>
    );
  }

  const tooltipAndDisabledAttributes = {
    disabled: props.isSupport && !props.isStaff,
    tooltip:
      props.isSupport && !props.isStaff
        ? translate('You must be staff to modify payments')
        : null,
  };

  const columns = [
    {
      title: translate('Date'),
      render: ({ row }) => formatDateTime(row.date_of_payment),
    },
    {
      title: translate('Sum'),
      render: ({ row }) => row.sum,
    },
    {
      title: translate('Proof'),
      render: PaymentProofRenderer,
    },
    {
      title: translate('Invoice'),
      render: PaymentInvoiceRenderer,
    },
    {
      title: translate('Actions'),
      render: ({ row }) => (
        <PaymentActions
          payment={row}
          tooltipAndDisabledAttributes={tooltipAndDisabledAttributes}
        />
      ),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('payments')}
      showPageSizeSelector={true}
      actions={
        <ActionButton
          title={translate('Add payment')}
          action={() => props.openCreateDialog(activePaymentProfile.url)}
          icon="fa fa-plus"
          {...tooltipAndDisabledAttributes}
        />
      }
    />
  );
};

const TableOptions = {
  table: PAYMENTS_TABLE,
  fetchData: createFetcher('payments'),
  mapPropsToFilter: (props) => ({
    profile_uuid: getActivePaymentProfile(props.customer.payment_profiles).uuid,
  }),
};

const mapStateToProps = (state) => ({
  customer: getCustomer(state),
  isStaff: isStaff(state),
  isSupport: isSupport(state),
});

const mapDispatchToProps = (dispatch) => ({
  openCreateDialog: (profileUrl: string) =>
    dispatch(openPaymentCreateDialog(profileUrl)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  connectTable(TableOptions),
);

export const PaymentsList = enhance(TableComponent);
