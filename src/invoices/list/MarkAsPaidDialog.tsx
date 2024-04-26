import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { FileUploadField, FormContainer, SubmitButton } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/invoices/api';
import { MARK_AS_PAID_FORM_ID } from '@waldur/invoices/constants';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showError, showSuccess } from '@waldur/store/notify';

const MarkAsPaidDialogContainer: FunctionComponent<any> = (props) => {
  const dispatch = useDispatch();
  async function markInvoiceAsPaid(formData) {
    try {
      await api.markAsPaid({
        formData,
        invoiceUuid: props.resolve.invoice.uuid,
      });
      dispatch(showSuccess(translate('The invoice has been marked as paid.')));
      dispatch(closeModalDialog());
      await props.resolve.refetch();
    } catch (error) {
      const errorMessage = `${translate(
        'Unable to mark the invoice as paid.',
      )} ${format(error)}`;
      dispatch(showError(errorMessage));
    }
  }

  return (
    <form onSubmit={props.handleSubmit(markInvoiceAsPaid)}>
      <ModalDialog
        title={translate('Mark invoice as paid')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={props.submitting}
              label={translate('Submit')}
            />
          </>
        }
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
