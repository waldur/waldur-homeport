import { Offering } from 'waldur-js-client';

import { StepDefinition, StepComponentProps } from 'waldur-wizard';

export interface FormStepProps extends StepComponentProps {
  offering: Offering;
  previewMode?: boolean;
}

export type OfferingConfigurationFormStep = StepDefinition<FormStepProps>;

export interface CheckoutSummaryProps {
  offering: Offering;
  updateMode?: boolean;
}
