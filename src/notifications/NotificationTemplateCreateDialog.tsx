import { connect } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { NotificationTemplateForm } from '@waldur/notifications/NotificationTemplateForm';
import { RootState } from '@waldur/store/reducers';

import { NOTIFICATION_TEMPLATE_CREATE_FORM_ID } from './constants';
import { NotificationTemplateFooter } from './NotificationTemplateFooter';
import { NotificationTemplateFormData } from './types';

export const NotificationTemplateCreateDialog = connect((state: RootState) => ({
  formValues: getFormValues(NOTIFICATION_TEMPLATE_CREATE_FORM_ID)(state),
}))(
  reduxForm<
    NotificationTemplateFormData,
    { resolve: { refetch }; formValues: NotificationTemplateFormData }
  >({
    form: NOTIFICATION_TEMPLATE_CREATE_FORM_ID,
  })(({ submitting, invalid, handleSubmit, resolve, formValues }) => {
    return (
      <form>
        <NotificationTemplateForm
          submitting={submitting}
          formValues={formValues}
        />
        <NotificationTemplateFooter
          handleSubmit={handleSubmit}
          disabled={invalid || submitting}
          refetch={resolve.refetch}
        />
      </form>
    );
  }),
);
