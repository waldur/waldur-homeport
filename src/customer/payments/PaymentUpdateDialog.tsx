import { FunctionComponent, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { paymentsPartialUpdate } from 'waldur-js-client';

import { formDataOptions, fileSerializer } from '@/core/api';
import { formatISODate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { EDIT_PAYMENT_FORM_ID } from '@/customer/payments/constants';
import { PaymentProofRenderer } from '@/customer/payments/PaymentProofRenderer';
import {
  getInitialValues,
  updatePaymentsList,
} from '@/customer/payments/utils';
import {
  FileUploadField,
  FormContainer,
  NumberField,
  SubmitButton,
} from '@/form';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { showSuccess, showErrorResponse } from '@/store/notify';
import { getCustomer } from '@/workspace/selectors';
import { Payment } from '@/workspace/types';

const PaymentUpdateDialog: FunctionComponent<
  InjectedFormProps & { resolve: Payment }
> = (props) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);

  useEffect(() => {
    props.initialize(getInitialValues(props));
  }, [props]);

  const submitRequest = async (formData) => {
    try {
      await paymentsPartialUpdate({
        path: { uuid: props.resolve.uuid },
        body: {
          date_of_payment: formatISODate(formData.date_of_payment),
          sum: formData.sum,
          proof: fileSerializer(formData.proof),
        },
        ...formDataOptions,
      });
      dispatch(showSuccess(translate('Payment has been updated.')));
      dispatch(closeModalDialog());
      dispatch(updatePaymentsList(customer));
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to update payment.')),
      );
    }
  };

  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
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
        <FormContainer submitting={false} clearOnUnmount={false}>
          <DateField
            name="date_of_payment"
            label={translate('Date')}
            required
          />

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
            <Form.Group>
              <Form.Label className="col-sm-2">
                {translate('Invoice')}
              </Form.Label>
              <div className="col-sm-8" style={{ marginTop: '8px' }}>
                <Link
                  state="billingDetails"
                  params={{
                    uuid: props.resolve.customer_uuid,
                    invoice_uuid: props.resolve.invoice_uuid,
                  }}
                  target="_blank"
                >
                  {props.resolve.invoice_period}
                </Link>
              </div>
            </Form.Group>
          ) : null}
        </FormContainer>
      </ModalDialog>
    </form>
  );
};

export const PaymentUpdateDialogContainer = reduxForm({
  form: EDIT_PAYMENT_FORM_ID,
})(PaymentUpdateDialog);
