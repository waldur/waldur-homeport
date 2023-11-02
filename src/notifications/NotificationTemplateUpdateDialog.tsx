import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { updateNotificationTemplate } from '@waldur/notifications/api';
import { NOTIFICATION_TEMPLATE_CREATE_FORM_ID } from '@waldur/notifications/constants';
import { NotificationTemplateForm } from '@waldur/notifications/NotificationTemplateForm';
import { NotificationTemplateFormData } from '@waldur/notifications/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface OwnProps {
  submitting: boolean;
  initialValues?: any;
  refetch?(): void;
  resolve;
}

const enhance = reduxForm<NotificationTemplateFormData, OwnProps>({
  form: NOTIFICATION_TEMPLATE_CREATE_FORM_ID,
});

export const NotificationTemplateUpdateDialog = connect(
  (_, ownProps: OwnProps) => ({
    initialValues: ownProps.resolve.template,
  }),
)(
  enhance(({ submitting, handleSubmit, resolve }) => {
    const dispatch = useDispatch();

    const callback = useCallback(
      async (formData: NotificationTemplateFormData) => {
        try {
          await updateNotificationTemplate(formData.uuid, formData);
          await resolve.refetch();
          dispatch(
            showSuccess(translate('Notification template has been updated.')),
          );
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to update a notification template.'),
            ),
          );
        }
      },
      [dispatch, resolve],
    );

    return (
      <ModalDialog title={translate('Update a notification template')}>
        <form onSubmit={handleSubmit(callback)}>
          <NotificationTemplateForm submitting={submitting} />
        </form>
      </ModalDialog>
    );
  }),
);
