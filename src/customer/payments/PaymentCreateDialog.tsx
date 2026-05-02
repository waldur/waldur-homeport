import { FunctionComponent } from 'react';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { paymentsCreate } from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { formatISODate } from '@/core/dateUtils';
import { ADD_PAYMENT_FORM_ID } from '@/customer/payments/constants';
import {
  FileUploadField,
  FormContainer,
  NumberField,
  SubmitButton,
} from '@/form';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface PaymentCreateDialogProps extends InjectedFormProps {
  resolve: {
    profileUrl: string;
    refetch;
  };
}

const PaymentCreateDialog: FunctionComponent<PaymentCreateDialogProps> = (
  props,
) => {
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
      paymentsCreate({
        body: {
          date_of_payment: formatISODate(formData.date_of_payment),
          sum: String(formData.sum),
          proof: fileSerializer(formData.proof),
          profile: props.resolve.profileUrl,
        },
        ...formDataOptions,
      }),
    successMessage: translate('Payment has been created.'),
    errorMessage: translate('Unable to create payment.'),
    refetch: props.resolve.refetch,
  });

  const submitRequest = async (formData) => {
    await mutation.mutateAsync(formData);
  };

  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Add payment')}
        footer={
          <>
            <CloseDialogButton className="me-3" />
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Submit')}
            />
          </>
        }
      >
        <div style={{ paddingBottom: '50px' }}>
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
          </FormContainer>
        </div>
      </ModalDialog>
    </form>
  );
};

export const PaymentCreateDialogContainer = reduxForm({
  form: ADD_PAYMENT_FORM_ID,
})(PaymentCreateDialog);
