import * as React from 'react';
import * as ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { connect } from 'react-redux';

import {
  enablePaymentProfile,
  removePaymentProfile,
} from '@waldur/customer/payment-profiles/store/actions';
import { translate } from '@waldur/i18n';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { PaymentProfile } from '@waldur/workspace/types';

import { PaymentProfileUpdateDialogContainer } from './PaymentProfileUpdateDialog';

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
  openModalDialog(PaymentProfileUpdateDialogContainer, {
    resolve: profile,
    size: 'lg',
  });

const Actions = (props) => (
  <ButtonGroup>
    {!props.profile.is_active ? (
      <ActionButton
        title={translate('Enable')}
        action={() => props.enable(props.profile)}
        icon="fa fa-play"
        {...props.tooltipAndDisabledAttributes}
      />
    ) : null}
    <ActionButton
      title={translate('Edit')}
      action={() => props.openUpdateDialog(props.profile)}
      icon="fa fa-edit"
      {...props.tooltipAndDisabledAttributes}
    />
    <ActionButton
      title={translate('Delete')}
      action={() => props.openConfirmationDialog(props.profile)}
      icon="fa fa-trash"
      {...props.tooltipAndDisabledAttributes}
    />
  </ButtonGroup>
);

const mapDispatchToProps = (dispatch) => ({
  openConfirmationDialog: (profile: PaymentProfile) =>
    openDialog(dispatch, profile),
  openUpdateDialog: (profile: PaymentProfile) =>
    dispatch(openPaymentProfileUpdateDialog(profile)),
  enable: (profile: PaymentProfile) =>
    dispatch(enablePaymentProfile(profile.uuid)),
});

const enhance = connect(null, mapDispatchToProps);

export const PaymentProfileActions = enhance(Actions);
