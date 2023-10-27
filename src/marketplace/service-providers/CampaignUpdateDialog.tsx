import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { CampaignFooter } from '@waldur/marketplace/service-providers/CampaignFooter';
import { CampaignUpdateForm } from '@waldur/marketplace/service-providers/CampaignUpdateForm';
import { CAMPAIGN_CREATE_FORM_ID } from '@waldur/marketplace/service-providers/constants';
import { CampaignFormData } from '@waldur/marketplace/service-providers/types';
import { RootState } from '@waldur/store/reducers';

export const CampaignUpdateDialog = connect((state: RootState) => ({
  formValues: getFormValues(CAMPAIGN_CREATE_FORM_ID)(state),
}))(
  reduxForm<
    CampaignFormData,
    { resolve: { campaign; fetch }; formValues: CampaignFormData }
  >({
    form: CAMPAIGN_CREATE_FORM_ID,
  })(({ submitting, formValues, handleSubmit, invalid, resolve }) => {
    const [step, setStep] = useState(0);
    return (
      <form>
        <Modal.Header closeButton className="without-border">
          <h2 className="fw-bolder">{translate('Update a campaign')}</h2>
        </Modal.Header>
        <CampaignUpdateForm
          submitting={submitting}
          formValues={formValues}
          step={step}
          setStep={setStep}
          initialValues={resolve.campaign}
        />
        <CampaignFooter
          step={step}
          setStep={setStep}
          handleSubmit={handleSubmit}
          disabled={invalid || submitting}
          refetch={resolve.fetch}
          isUpdate={true}
        />
      </form>
    );
  }),
);
