import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import { NOTIFICATION_CREATE_FORM_ID } from '@waldur/issues/notifications/constants';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { createNotification } from './api';
import { NotificationForm } from './NotificationForm';
import { serializeNotification } from './utils';

export const NotificationCreateDialog = reduxForm<any, any>({
  form: NOTIFICATION_CREATE_FORM_ID,
})(({ submitting, invalid, handleSubmit, resolve }) => {
  const dispatch = useDispatch();

  const callback = useCallback(
    async (formData) => {
      try {
        await createNotification(serializeNotification(formData));
        await resolve.refreshList();
        dispatch(showSuccess(translate('Notification has been created.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to create notifications.')),
        );
      }
    },
    [dispatch],
  );

  return (
    <form onSubmit={handleSubmit(callback)}>
      <Modal.Header closeButton>
        <h2 className="fw-bolder">{translate('Create a broadcast')}</h2>
      </Modal.Header>
      <NotificationForm submitting={submitting} />
      <Modal.Footer>
        <SubmitButton
          block={false}
          label={translate('Create')}
          submitting={submitting}
          invalid={invalid}
        />
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
});
