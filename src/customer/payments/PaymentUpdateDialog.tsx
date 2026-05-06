import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Form as FinalForm } from 'react-final-form';
import { paymentsPartialUpdate } from 'waldur-js-client';

import { formDataOptions, fileSerializer } from '@/core/api';
import { formatISODate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { PaymentProofRenderer } from '@/customer/payments/PaymentProofRenderer';
import { getInitialValues } from '@/customer/payments/utils';
import {
  FileUploadField,
  FormContainerFinal,
  NumberField,
  SubmitButton,
} from '@/form';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Payment } from '@/workspace/types';

interface PaymentUpdateDialogProps {
  resolve: Payment & { refetch?: () => void };
}

export const PaymentUpdateDialog: FunctionComponent<
  PaymentUpdateDialogProps
> = (props) => {
  const mutation = useManagedMutation<
    any,
    any,
    {
      date_of_payment: string;
      sum: number | string;
      proof: File;
    }
  >({
    mutationFn: (formData) =>
      paymentsPartialUpdate({
        path: { uuid: props.resolve.uuid },
        body: {
          date_of_payment: formatISODate(formData.date_of_payment),
          sum: String(formData.sum),
          proof: fileSerializer(formData.proof),
        },
        ...formDataOptions,
      }),

    successMessage: translate('Payment has been updated.'),
    errorMessage: translate('Unable to update payment.'),
    refetch: props.resolve.refetch,
  });

  const submitRequest = async (formData) => {
    try {
      await mutation.mutateAsync(formData);
    } catch {
      // Error is handled by useManagedMutation
    }
  };

  return (
    <FinalForm
      initialValues={getInitialValues(props)}
      onSubmit={submitRequest}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Update payment')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Update')}
                />
              </>
            }
          >
            <FormContainerFinal submitting={submitting}>
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
            </FormContainerFinal>
          </ModalDialog>
        </form>
      )}
    />
  );
};
