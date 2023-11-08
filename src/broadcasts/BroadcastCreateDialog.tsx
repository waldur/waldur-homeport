import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { BroadcastFooter } from './BroadcastFooter';
import { BroadcastForm } from './BroadcastForm';
import { BROADCAST_CREATE_FORM_ID } from './constants';
import { BroadcastFormData } from './types';

export const BroadcastCreateDialog = connect((state: RootState) => ({
  formValues: getFormValues(BROADCAST_CREATE_FORM_ID)(state),
}))(
  reduxForm<
    BroadcastFormData,
    { resolve: { refetch }; formValues: BroadcastFormData }
  >({
    form: BROADCAST_CREATE_FORM_ID,
  })(({ submitting, invalid, handleSubmit, resolve, formValues }) => {
    const [step, setStep] = useState(0);

    return (
      <form>
        <Modal.Header closeButton className="without-border">
          <h2 className="fw-bolder">{translate('Create a broadcast')}</h2>
        </Modal.Header>
        <BroadcastForm
          submitting={submitting}
          formValues={formValues}
          step={step}
          setStep={setStep}
        />
        <BroadcastFooter
          step={step}
          setStep={setStep}
          handleSubmit={handleSubmit}
          disabled={invalid || submitting}
          refetch={resolve.refetch}
        />
      </form>
    );
  }),
);
