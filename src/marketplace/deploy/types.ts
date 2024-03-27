import {
  VStepperFormStep,
  VStepperFormStepProps,
} from '@waldur/form/VStepperFormStep';
import { Offering } from '@waldur/marketplace/types';

export interface FormStepProps extends VStepperFormStepProps {
  offering: Offering;
}

export type OfferingConfigurationFormStep = VStepperFormStep<FormStepProps>;

export interface CheckoutSummaryProps {
  offering: Offering;
  updateMode?: boolean;
}
