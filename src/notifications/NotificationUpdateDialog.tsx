import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { NOTIFICATION_UPDATE_FORM_ID } from './constants';
import { NotificationFooter } from './NotificationFooter';
import { NotificationForm } from './NotificationForm';
import { NotificationFormData } from './types';

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
    const [step, setStep] = useState(0);

    return (
      <form>
        <Modal.Header closeButton className="without-border">
          <h2 className="fw-bolder">{translate('Update a notification')}</h2>
        </Modal.Header>
        <NotificationForm
          submitting={submitting}
          formValues={formValues}
          step={step}
          setStep={setStep}
        />
        <NotificationFooter
          step={step}
          setStep={setStep}
          handleSubmit={handleSubmit}
          disabled={invalid || submitting}
          refreshList={resolve.refreshList}
          notificationId={resolve.uuid}
        />
      </form>
    );
  }),
);
