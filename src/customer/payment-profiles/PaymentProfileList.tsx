import { useRouter } from '@uirouter/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { PAYMENT_PROFILES_TABLE } from '@waldur/customer/details/constants';
import { removePaymentProfile } from '@waldur/customer/payment-profiles/store/actions';
import { translate } from '@waldur/i18n';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { ActionButton } from '@waldur/table-react/ActionButton';
import { getCustomer, isStaff, isSupport } from '@waldur/workspace/selectors';
import { PaymentProfile } from '@waldur/workspace/types';

const openDialog = async (dispatch, profile: PaymentProfile) => {
  try {
    await waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate('Are you sure you want to delete the payment profile?'),
    );
  } catch {
    return;
  }
  dispatch(removePaymentProfile(profile.uuid));
};

const openPaymentProfileUpdateDialog = (profile: PaymentProfile) =>
  openModalDialog('paymentProfileUpdateDialog', {
    resolve: profile,
    size: 'lg',
  });

export const TableComponent = props => {
  const router = useRouter();

  const columns = [
    {
      title: translate('Type'),
      render: ({ row }) => row.payment_type_display,
    },
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
    },
    {
      title: translate('Status'),
      render: ({ row }) => (
        <StateIndicator
          label={row.is_active ? translate('Enabled') : translate('Disabled')}
          variant={row.is_active ? 'success' : 'plain'}
        />
      ),
    },
    {
      title: translate('Actions'),
      render: ({ row }) => (
        <>
          <ActionButton
            title={translate('Edit')}
            action={() => props.openUpdateDialog(row)}
            icon="fa fa-edit"
            tooltip={
              props.isSupport && !props.isStaff
                ? translate('You must be staff to modify payment profiles')
                : null
            }
            disabled={props.isSupport && !props.isStaff}
          />
          <ActionButton
            title={translate('Delete')}
            action={() => props.openConfirmationDialog(row)}
            icon="fa fa-trash"
            tooltip={
              props.isSupport && !props.isStaff
                ? translate('You must be staff to modify payment profiles')
                : null
            }
            disabled={props.isSupport && !props.isStaff}
          />
        </>
      ),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('payment profiles')}
      showPageSizeSelector={true}
      actions={
        <ActionButton
          title={translate('Add payment profile')}
          action={() => router.stateService.go('payment-profile-create')}
          icon="fa fa-plus"
          tooltip={
            props.isSupport && !props.isStaff
              ? translate('You must be staff to modify payment profiles')
              : null
          }
          disabled={props.isSupport && !props.isStaff}
        />
      }
    />
  );
};

const TableOptions = {
  table: PAYMENT_PROFILES_TABLE,
  fetchData: createFetcher('payment-profiles'),
  mapPropsToFilter: props => ({ organization_uuid: props.customer.uuid }),
};

const mapStateToProps = state => ({
  customer: getCustomer(state),
  isStaff: isStaff(state),
  isSupport: isSupport(state),
});

const mapDispatchToProps = dispatch => ({
  openConfirmationDialog: (profile: PaymentProfile) =>
    openDialog(dispatch, profile),
  openUpdateDialog: (profile: PaymentProfile) =>
    dispatch(openPaymentProfileUpdateDialog(profile)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  connectTable(TableOptions),
);

export const PaymentProfileList = enhance(TableComponent);
