import { WarningCircle } from '@phosphor-icons/react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { FormContainer, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ActionButton } from '@waldur/table/ActionButton';

import { DELETE_CUSTOMER_FORM_ID } from './constants';

interface CustomerRemoveDialogProps {
  resolve: {
    action: () => void;
    customerName: string;
  };
  dismiss: () => void;
}

export const PureCustomerRemoveDialog = reduxForm<
  { reason },
  CustomerRemoveDialogProps
>({
  form: DELETE_CUSTOMER_FORM_ID,
})((props) => (
  <form>
    <ModalDialog
      headerLess
      footerClassName="border-0 pt-0 gap-2"
      footer={
        <>
          <CloseDialogButton
            variant="outline btn-outline-default"
            className="flex-grow-1"
          />
          <ActionButton
            title={translate('Delete')}
            variant="light-danger"
            action={props.handleSubmit(() => {
              props.resolve.action();
              props.dismiss();
            })}
            className="flex-grow-1"
          />
        </>
      }
    >
      <div className="d-flex flex-center w-40px h-40px bg-light-danger rounded-circle mb-6">
        <WarningCircle size={22} className="text-danger" />
      </div>
      <h3 className="fw-bold">{translate('Organization removal')}</h3>
      <p className="text-muted mb-8">
        {translate('Organization')}:{' '}
        <strong>{props.resolve.customerName}</strong>
      </p>
      <FormContainer submitting={props.submitting}>
        <TextField
          name="reason"
          label={translate('Reason')}
          placeholder={translate('e.g. This organization is irrelevant')}
        />
      </FormContainer>
    </ModalDialog>
  </form>
));

const mapDispatchToProps = (dispatch) => ({
  dismiss: () => dispatch(closeModalDialog()),
});

export const CustomerRemoveDialog = connect(
  null,
  mapDispatchToProps,
)(PureCustomerRemoveDialog);
