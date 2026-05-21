import { FunctionComponent, useMemo } from 'react';
import { Form } from 'react-final-form';
import { invoicesPaid } from 'waldur-js-client';

import { formDataOptions, fileSerializer } from '@/core/api';
import { formatISODate } from '@/core/dateUtils';
import { FileUploadField, FormContainer, FormFooter } from '@/form';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const MarkAsPaidDialog: FunctionComponent<any> = (props) => {
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

  const validate = useMemo(
    () => (values) => {
      const errors: any = {};
      if (values.proof && !values.date) {
        errors.date = translate('Please, select a date.');
      }
      return errors;
    },
    [],
  );

  return (
    <Form
      onSubmit={(values) => markInvoiceAsPaidMutation.mutateAsync(values)}
      validate={validate}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Mark invoice as paid')}
            footer={<FormFooter submitting={submitting} />}
          >
            <div style={{ paddingBottom: '95px' }}>
              <FormContainer submitting={submitting}>
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
      )}
    />
  );
};
