import { Offering } from 'waldur-js-client';

import { VStepperFormStep, VStepperFormStepProps } from '@/wizard';

export interface FormStepProps extends VStepperFormStepProps {
  offering: Offering;
  previewMode?: boolean;
}

export type OfferingConfigurationFormStep = VStepperFormStep<FormStepProps>;

export interface CheckoutSummaryProps {
  offering: Offering;
  updateMode?: boolean;
}
