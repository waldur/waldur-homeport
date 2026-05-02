import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';
import { invoicesPaid } from 'waldur-js-client';

import { formDataOptions, fileSerializer } from '@/core/api';
import { formatISODate } from '@/core/dateUtils';
import { FileUploadField, FormContainer, FormFooter } from '@/form';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { MARK_AS_PAID_FORM_ID } from '@/invoices/constants';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

const MarkAsPaidDialogContainer: FunctionComponent<any> = (props) => {
  const markInvoiceAsPaidMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      invoicesPaid({
        path: { uuid: props.resolve.invoice.uuid },
        body: {
          date: formData.date ? formatISODate(formData.date) : undefined,
          proof: fileSerializer(formData.proof),
        },
        ...formDataOptions,
      }),
    successMessage: translate('The invoice has been marked as paid.'),
    errorMessage: translate('Unable to mark the invoice as paid.'),
    refetch: props.resolve.refetch,
  });

  return (
    <form
      onSubmit={props.handleSubmit((values) =>
        markInvoiceAsPaidMutation.mutateAsync(values),
      )}
    >
      <ModalDialog
        title={translate('Mark invoice as paid')}
        footer={<FormFooter submitting={props.submitting} />}
      >
        <div style={{ paddingBottom: '95px' }}>
          <FormContainer submitting={props.submitting}>
            <DateField name="date" label={translate('Date')} />

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

const validate = (values) => {
  const errors: any = {};
  if (values.proof && !values.date) {
    errors.date = { _error: translate('Please, select a date.') };
  }
  return errors;
};

export const MarkAsPaidDialog = reduxForm({
  form: MARK_AS_PAID_FORM_ID,
  validate,
})(MarkAsPaidDialogContainer);
