import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import { NOTIFICATION_UPDATE_FORM_ID } from '@waldur/issues/notifications/constants';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { updateNotification } from './api';
import { NotificationForm } from './NotificationForm';
import { serializeNotification } from './utils';

export const NotificationUpdateDialog = connect((_, ownProps: any) => ({
  initialValues: ownProps.resolve.initialValues,
}))(
  reduxForm<any, any>({
    form: NOTIFICATION_UPDATE_FORM_ID,
  })(({ submitting, invalid, handleSubmit, resolve }) => {
    const dispatch = useDispatch();

    const callback = useCallback(
      async (formData) => {
        try {
          await updateNotification(
            resolve.uuid,
            serializeNotification(formData),
          );
          await resolve.refreshList();
          dispatch(showSuccess(translate('Notification has been updated.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to update notifications.')),
          );
        }
      },
      [dispatch],
    );

    return (
      <form onSubmit={handleSubmit(callback)}>
        <Modal.Header closeButton>
          <h2 className="fw-bolder">{translate('Update a notification')}</h2>
        </Modal.Header>
        {NotificationForm(submitting)}
        <Modal.Footer>
          <SubmitButton
            block={false}
            label={translate('Update')}
            submitting={submitting}
            invalid={invalid}
          />
          <CloseDialogButton />
        </Modal.Footer>
      </form>
    );
  }),
);
