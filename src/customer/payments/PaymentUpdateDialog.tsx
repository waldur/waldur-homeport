import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { Link } from '@waldur/core/Link';
import { EDIT_PAYMENT_FORM_ID } from '@waldur/customer/payments/constants';
import { PaymentProofRenderer } from '@waldur/customer/payments/PaymentProofRenderer';
import { updatePayment } from '@waldur/customer/payments/store/actions';
import { getInitialValues } from '@waldur/customer/payments/utils';
import {
  FileUploadField,
  FormContainer,
  NumberField,
  SubmitButton,
} from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

const PaymentUpdateDialog: FunctionComponent<any> = (props) => (
  <form
    onSubmit={props.handleSubmit(props.submitRequest)}
    className="form-horizontal"
  >
    <ModalDialog
      title={translate('Update payment')}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Update')}
          />
        </>
      }
    >
      <FormContainer
        submitting={false}
        labelClass="col-sm-2"
        controlClass="col-sm-8"
        clearOnUnmount={false}
      >
        <DateField name="date_of_payment" label={translate('Date')} required />

        <NumberField name="sum" label={translate('Sum')} required />

        <FileUploadField
          name="proof"
          label={translate('Proof')}
          showFileName={true}
          buttonLabel={translate('Browse')}
        />
        {props.resolve.proof ? (
          <span style={{ marginLeft: '145px' }}>
            <PaymentProofRenderer row={props.resolve} />
          </span>
        ) : null}

        {props.resolve.invoice_uuid && props.resolve.invoice_period ? (
          <div className="form-group">
            <label className="control-label col-sm-2">
              {translate('Invoice')}
            </label>
            <div className="col-sm-8" style={{ marginTop: '8px' }}>
              <Link
                state="billingDetails"
                params={{ uuid: props.resolve.invoice_uuid }}
                target="_blank"
              >
                {props.resolve.invoice_period}
              </Link>
            </div>
          </div>
        ) : null}
      </FormContainer>
    </ModalDialog>
  </form>
);

const mapStateToProps = (_state, ownProps) => ({
  initialValues: getInitialValues(ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  submitRequest: (formData) =>
    dispatch(updatePayment(ownProps.resolve.uuid, formData)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: EDIT_PAYMENT_FORM_ID,
  }),
);

export const PaymentUpdateDialogContainer = enhance(PaymentUpdateDialog);
