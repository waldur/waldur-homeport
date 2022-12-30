import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { NOTIFICATION_CREATE_FORM_ID } from './constants';
import { NotificationFooter } from './NotificationFooter';
import { NotificationForm } from './NotificationForm';
import { NotificationFormData } from './types';

export const NotificationCreateDialog = connect((state: RootState) => ({
  formValues: getFormValues(NOTIFICATION_CREATE_FORM_ID)(state),
}))(
  reduxForm<
    NotificationFormData,
    { resolve: { refreshList }; formValues: NotificationFormData }
  >({
    form: NOTIFICATION_CREATE_FORM_ID,
  })(({ submitting, invalid, handleSubmit, resolve, formValues }) => {
    const [step, setStep] = useState(0);

    return (
      <form>
        <Modal.Header closeButton className="without-border">
          <h2 className="fw-bolder">{translate('Create a broadcast')}</h2>
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
        />
      </form>
    );
  }),
);
