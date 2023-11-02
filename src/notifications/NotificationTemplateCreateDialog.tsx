import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { createNotificationTemplate } from '@waldur/notifications/api';
import { NotificationTemplateForm } from '@waldur/notifications/NotificationTemplateForm';
import { NotificationTemplateFormData } from '@waldur/notifications/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { NOTIFICATION_TEMPLATE_CREATE_FORM_ID } from './constants';

export const NotificationTemplateCreateDialog = connect()(
  reduxForm<NotificationTemplateFormData, { resolve: { refetch } }>({
    form: NOTIFICATION_TEMPLATE_CREATE_FORM_ID,
  })(({ submitting, handleSubmit, resolve }) => {
    const dispatch = useDispatch();
    const callback = useCallback(
      async (formData: NotificationTemplateFormData) => {
        try {
          await createNotificationTemplate(formData);
          await resolve.refetch();
          dispatch(
            showSuccess(translate('Notification template has been created.')),
          );
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to create a notification template.'),
            ),
          );
        }
      },
      [dispatch, resolve],
    );

    return (
      <ModalDialog title={translate('Create a notification template')}>
        <form onSubmit={handleSubmit(callback)}>
          <NotificationTemplateForm submitting={submitting} />
        </form>
      </ModalDialog>
    );
  }),
);
