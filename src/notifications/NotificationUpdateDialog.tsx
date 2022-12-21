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

import { updateNotification } from './api';
import { NOTIFICATION_UPDATE_FORM_ID } from './constants';
import { NotificationForm } from './NotificationForm';
import { NotificationFormData } from './types';
import { serializeNotification } from './utils';

interface NotificationUpdateDialogOwnProps {
  resolve: {
    initialValues: NotificationFormData;
    uuid: string;
    refreshList(): void;
  };
  formValues: NotificationFormData;
}

export const NotificationUpdateDialog = connect(
  (state: RootState, ownProps: NotificationUpdateDialogOwnProps) => ({
    initialValues: ownProps.resolve.initialValues,
    formValues: getFormValues(NOTIFICATION_UPDATE_FORM_ID)(state),
  }),
)(
  reduxForm<NotificationFormData, NotificationUpdateDialogOwnProps>({
    form: NOTIFICATION_UPDATE_FORM_ID,
  })(({ submitting, invalid, handleSubmit, resolve, formValues }) => {
    const dispatch = useDispatch();

    const callback = useCallback(
      async (formData: NotificationFormData) => {
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
      [dispatch, resolve],
    );

    return (
      <form onSubmit={handleSubmit(callback)}>
        <Modal.Header closeButton>
          <h2 className="fw-bolder">{translate('Update a notification')}</h2>
        </Modal.Header>
        <NotificationForm submitting={submitting} formValues={formValues} />
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
