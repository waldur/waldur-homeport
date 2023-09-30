import { Offering } from '@waldur/marketplace/types';

export interface OfferingConfigurationFormStep {
  label: string;
  id: string;
  fields?: Array<string>;
  required?: boolean;
  requiredFields?: Array<string>;
  component: React.ComponentType<FormStepProps>;
  params?: Record<string, any>;
}

export interface FormStepProps {
  step: number;
  id: string;
  offering: Offering;
  observed?: boolean;
  change?(field: string, value: any): void;
  params?: OfferingConfigurationFormStep['params'];
}

export interface CheckoutSummaryProps {
  offering: Offering;
  updateMode?: boolean;
}
