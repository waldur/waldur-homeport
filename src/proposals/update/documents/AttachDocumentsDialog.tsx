import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { FormContainer } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FileField } from '@waldur/issues/create/FileField';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { attachDocuments } from '@waldur/proposals/update/documents/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface AttachDocumentsFormData {
  files: { file: File }[];
}

interface AttachDocumentsProps {
  resolve: { refetch; call };
}

export const AttachDocumentsDialog = reduxForm<
  AttachDocumentsFormData,
  AttachDocumentsProps
>({
  form: 'AttachDocumentsDialog',
})(({ resolve: { call, refetch }, submitting, handleSubmit }) => {
  const dispatch = useDispatch();
  const callback = async (formData: AttachDocumentsFormData) => {
    try {
      const files = Object.values(formData.files);
      if (files) {
        await Promise.all(
          Array.from(files).map((file) => attachDocuments(call, file)),
        );
      }
      refetch();
      dispatch(showSuccess(translate('Documents have been attached.')));
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate(
            'An error occurred while attaching documents. Please try again.',
          ),
        ),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(callback)}>
      <Modal.Header>
        <Modal.Title>{translate('Add call attachments')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormContainer submitting={submitting}>
          <Field name="files" component={FileField} disabled={submitting} />
        </FormContainer>
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton submitting={submitting} label={translate('Save')} />
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
});
