import { Offering } from '@waldur/marketplace/types';

export interface OfferingConfigurationFormStep {
  label: string;
  id: string;
  fields?: Array<string>;
  required?: boolean;
  requiredFields?: Array<string>;
  component: React.ComponentType<FormStepProps>;
  params?: Record<string, any>;
  isActive?: (offering: Offering) => boolean;
}

export interface FormStepProps {
  step: number;
  id: string;
  offering: Offering;
  title?: string;
  observed?: boolean;
  disabled?: boolean;
  change?(field: string, value: any): void;
  required?: boolean;
  params?: OfferingConfigurationFormStep['params'];
}

export interface CheckoutSummaryProps {
  offering: Offering;
  updateMode?: boolean;
}
