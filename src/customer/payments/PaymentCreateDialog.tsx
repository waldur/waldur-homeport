import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import { paymentsCreate } from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { formatISODate } from '@/core/dateUtils';
import { FileUploadGroup, SubmitButton, DateGroup, NumberGroup } from '@/form';
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

interface FormValues {
  date_of_payment: string;
  sum: number | string;
  proof: File;
}

export const PaymentCreateDialog: FunctionComponent<
  PaymentCreateDialogProps
> = (props) => {
  const mutation = useManagedMutation<any, any, FormValues>({
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

  return (
    <Form<FormValues>
      onSubmit={mutation.mutateAsync}
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
            <div style={{ paddingBottom: '50px' }} className="size-sm">
              <DateGroup
                name="date_of_payment"
                label={translate('Date')}
                required
                disabled={submitting}
              />

              <NumberGroup
                name="sum"
                label={translate('Sum')}
                required
                disabled={submitting}
              />

              <FileUploadGroup
                name="proof"
                label={translate('Proof')}
                showFileName={true}
                buttonLabel={translate('Browse')}
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
