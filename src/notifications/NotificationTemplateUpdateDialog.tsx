import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { NOTIFICATION_TEMPLATE_CREATE_FORM_ID } from '@waldur/notifications/constants';
import { NotificationTemplateFooter } from '@waldur/notifications/NotificationTemplateFooter';
import { NotificationTemplateUpdateForm } from '@waldur/notifications/NotificationTemplateUpdateForm';
import { NotificationTemplateFormData } from '@waldur/notifications/types';
import { RootState } from '@waldur/store/reducers';

export const NotificationTemplateUpdateDialog = connect((state: RootState) => ({
  formValues: getFormValues(NOTIFICATION_TEMPLATE_CREATE_FORM_ID)(state),
}))(
  reduxForm<
    NotificationTemplateFormData,
    { resolve: { template; fetch }; formValues: NotificationTemplateFormData }
  >({
    form: NOTIFICATION_TEMPLATE_CREATE_FORM_ID,
  })(({ submitting, formValues, handleSubmit, invalid, resolve }) => {
    return (
      <form>
        <Modal.Header closeButton className="without-border">
          <h2 className="fw-bolder">{translate('Update a template')}</h2>
        </Modal.Header>
        <NotificationTemplateUpdateForm
          submitting={submitting}
          formValues={formValues}
          initialValues={resolve.template}
        />
        <NotificationTemplateFooter
          handleSubmit={handleSubmit}
          disabled={invalid || submitting}
          refetch={resolve.fetch}
          isUpdate={true}
        />
      </form>
    );
  }),
);
