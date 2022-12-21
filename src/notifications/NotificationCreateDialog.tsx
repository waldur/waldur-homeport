import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

import { createNotification } from './api';
import { NOTIFICATION_CREATE_FORM_ID } from './constants';
import { NotificationForm } from './NotificationForm';
import { NotificationFormData } from './types';
import { serializeNotification } from './utils';

export const NotificationCreateDialog = connect((state: RootState) => ({
  formValues: getFormValues(NOTIFICATION_CREATE_FORM_ID)(state),
}))(
  reduxForm<
    NotificationFormData,
    { resolve: { refreshList }; formValues: NotificationFormData }
  >({
    form: NOTIFICATION_CREATE_FORM_ID,
  })(({ submitting, invalid, handleSubmit, resolve, formValues }) => {
    const dispatch = useDispatch();

    const callback = useCallback(
      async (formData: NotificationFormData) => {
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
      [dispatch, resolve],
    );

    return (
      <form onSubmit={handleSubmit(callback)}>
        <Modal.Header closeButton>
          <h2 className="fw-bolder">{translate('Create a broadcast')}</h2>
        </Modal.Header>
        <NotificationForm submitting={submitting} formValues={formValues} />
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
  }),
);
