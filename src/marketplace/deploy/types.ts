import { PublicOfferingDetails } from 'waldur-js-client';

import { VStepperFormStep, VStepperFormStepProps } from '@/wizard';

export interface FormStepProps extends VStepperFormStepProps {
  offering: PublicOfferingDetails;
  previewMode?: boolean;
}

export type OfferingConfigurationFormStep = VStepperFormStep<FormStepProps>;

export interface CheckoutSummaryProps {
  offering: PublicOfferingDetails;
  updateMode?: boolean;
}
