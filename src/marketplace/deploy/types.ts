import { PublicOfferingDetails } from 'waldur-js-client';

import {
  VStepperFormStep,
  VStepperFormStepProps,
} from '@/form/VStepperFormStep';

export interface FormStepProps extends VStepperFormStepProps {
  offering: PublicOfferingDetails;
  previewMode?: boolean;
}

export type OfferingConfigurationFormStep = VStepperFormStep<FormStepProps>;

export interface CheckoutSummaryProps {
  offering: PublicOfferingDetails;
  updateMode?: boolean;
}
