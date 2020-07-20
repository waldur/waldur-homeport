import * as React from 'react';
import { useDispatch } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { sendForm } from '@waldur/core/api';
import { formatDate } from '@waldur/core/dateUtils';
import { ENV } from '@waldur/core/services';
import { FileUploadField, FormContainer, SubmitButton } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { MARK_AS_PAID_FORM_ID } from '@waldur/invoices/constants';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showError, showSuccess } from '@waldur/store/coreSaga';

const MarkAsPaidDialogContainer = (props) => {
  const dispatch = useDispatch();
  const onSubmit = async (formData) => {
    if (props.invalid) {
      return;
    }
    try {
      const reqData = {
        date: formData.date ? formatDate(formData.date) : undefined,
        proof: formData.proof,
      };
      await sendForm(
        'POST',
        `${ENV.apiEndpoint}api/invoices/${props.resolve.uuid}/paid/`,
        reqData,
      );
      dispatch(showSuccess(translate('The invoice has been marked as paid.')));
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(showError(translate('Unable to mark the invoice as paid.')));
    }
  };

  return (
    <form onSubmit={props.handleSubmit(onSubmit)} className="form-horizontal">
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
          <FormContainer
            submitting={props.submitting}
            labelClass="col-sm-2"
            controlClass="col-sm-8"
          >
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

const enhance = compose(
  reduxForm({
    form: MARK_AS_PAID_FORM_ID,
    validate,
  }),
);

export const MarkAsPaidDialog = enhance(MarkAsPaidDialogContainer);
