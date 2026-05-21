import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import { paymentsCreate } from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { formatISODate } from '@/core/dateUtils';
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

interface PaymentCreateDialogProps {
  resolve: {
    profileUrl?: string;
    refetch: () => void;
  };
}

export const PaymentCreateDialog: FunctionComponent<
  PaymentCreateDialogProps
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
    <Form
      onSubmit={submitRequest}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add payment')}
            footer={
              <>
                <CloseDialogButton className="me-3" />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Submit')}
                />
              </>
            }
          >
            <div style={{ paddingBottom: '50px' }}>
              <FormContainer submitting={submitting}>
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
      )}
    />
  );
};
