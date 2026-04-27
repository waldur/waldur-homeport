import { reduxForm } from 'redux-form';

import { CAMPAIGN_FORM_ID } from '@/marketplace/service-providers/constants';
import { CampaignFormData } from '@/marketplace/service-providers/types';

import { CampaignForm } from './CampaignForm';

interface OwnProps {
  submitting: boolean;
  formValues: CampaignFormData;
  step: number;
  setStep(step: number): void;
  initialValues?: any;
}

const enhance = reduxForm<CampaignFormData, OwnProps>({
  form: CAMPAIGN_FORM_ID,
});

export const CampaignUpdateForm = enhance(
  ({ submitting, step, setStep, formValues, invalid }) => (
    <CampaignForm
      submitting={submitting}
      formValues={formValues}
      step={step}
      setStep={setStep}
      isNextDisabled={invalid || submitting}
    />
  ),
);
