import { useState } from 'react';
import { connect } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { translate } from '@/i18n';
import { CampaignFooter } from '@/marketplace/service-providers/CampaignFooter';
import { CampaignForm } from '@/marketplace/service-providers/CampaignForm';
import { CAMPAIGN_FORM_ID } from '@/marketplace/service-providers/constants';
import { CampaignFormData } from '@/marketplace/service-providers/types';
import { ModalDialog } from '@/modal/ModalDialog';
import { type RootState } from '@/store/reducers';

export const CampaignCreateDialog = connect((state: RootState) => ({
  formValues: getFormValues(CAMPAIGN_FORM_ID)(state),
}))(
  reduxForm<
    CampaignFormData,
    { resolve: { refetch }; formValues: CampaignFormData }
  >({
    form: CAMPAIGN_FORM_ID,
  })(({ submitting, formValues, handleSubmit, invalid, resolve }) => {
    const [step, setStep] = useState(0);

    return (
      <form>
        <ModalDialog
          title={translate('Create a campaign')}
          footer={
            <CampaignFooter
              step={step}
              setStep={setStep}
              handleSubmit={handleSubmit}
              disabled={invalid || submitting}
              refetch={resolve.refetch}
            />
          }
        >
          <CampaignForm
            submitting={submitting}
            formValues={formValues}
            step={step}
            setStep={setStep}
            isNextDisabled={invalid || submitting}
          />
        </ModalDialog>
      </form>
    );
  }),
);
