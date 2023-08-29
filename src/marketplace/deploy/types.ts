import { Offering } from '@waldur/marketplace/types';

export interface FormStepProps {
  step: number;
  id: string;
  offering: Offering;
  observed?: boolean;
  change?(field: string, value: any): void;
}

export interface OfferingConfigurationFormStep {
  label: string;
  id: string;
  required?: boolean;
  requiredFields?: Array<string>;
  component: React.ComponentType<FormStepProps>;
}

export interface CheckoutSummaryProps {
  offering: Offering;
}
