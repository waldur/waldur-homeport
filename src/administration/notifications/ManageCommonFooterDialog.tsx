import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { saveConfig } from '@waldur/administration/service-desk/api';
import { ENV } from '@waldur/configs/default';
import { FormContainer, TextField } from '@waldur/form';
import { MonacoField } from '@waldur/form/MonacoField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface CommonFooterUpdateFormData {
  COMMON_FOOTER_HTML: string;
  COMMON_FOOTER_TEXT: string;
}

interface ManageCommonFooterDialogProps extends InjectedFormProps {
  resolve: {
    refetch: () => void;
  };
}

const ManageCommonFooterDialog = connect(() => ({
  initialValues: {
    COMMON_FOOTER_HTML: ENV.plugins.WALDUR_CORE.COMMON_FOOTER_HTML,
    COMMON_FOOTER_TEXT: ENV.plugins.WALDUR_CORE.COMMON_FOOTER_TEXT,
  },
}))(
  reduxForm<CommonFooterUpdateFormData, ManageCommonFooterDialogProps>({
    form: 'CommonFooterUpdateForm',
    enableReinitialize: true,
  })(({ submitting, handleSubmit, resolve }) => {
    const dispatch = useDispatch();
    const [isDeleting, setDeleting] = useState(false);

    const handleSave = async (formValues: CommonFooterUpdateFormData) => {
      try {
        await saveConfig(formValues);
        resolve.refetch();

        dispatch(showSuccess(translate('Common footer has been updated')));
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to update common footer.'),
          ),
        );
      }
    };

    const handleDelete = async () => {
      try {
        setDeleting(true);
        await saveConfig({
          COMMON_FOOTER_HTML: '',
          COMMON_FOOTER_TEXT: '',
        });
        resolve.refetch();

        dispatch(showSuccess(translate('Common footer has been deleted')));
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to delete common footer.'),
          ),
        );
      } finally {
        setDeleting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit(handleSave)}>
        <Modal.Header closeButton>
          <h2 className="fw-bolder">{translate('Update the common footer')}</h2>
        </Modal.Header>
        <FormContainer submitting={submitting}>
          <MonacoField
            name="COMMON_FOOTER_HTML"
            mode="html"
            height={100}
            label={translate('HTML content')}
            required={true}
          />
          <TextField
            name="COMMON_FOOTER_TEXT"
            label={translate('Text content')}
            required={true}
          />
          <div className="mb-5 text-end">
            <button
              className="btn btn-primary mr-2"
              type="submit"
              disabled={submitting}
            >
              {translate('Save')}
            </button>{' '}
            {ENV.plugins.WALDUR_CORE.COMMON_FOOTER_HTML ||
            ENV.plugins.WALDUR_CORE.COMMON_FOOTER_TEXT ? (
              <button
                className="btn btn-danger"
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {translate('Delete')}
              </button>
            ) : null}
          </div>
        </FormContainer>
      </form>
    );
  }),
);

export default ManageCommonFooterDialog;
