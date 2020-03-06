import { Offering, Plan } from '@waldur/marketplace/types';
import { Customer, Project } from '@waldur/workspace/types';

export interface Limits {
  [key: string]: number;
}

export interface OfferingFormData {
  plan?: Plan;
  attributes?: { [key: string]: any };
  project?: Project;
  limits?: Limits;
}

export interface OrderSummaryProps {
  offering: Offering;
  customer: Customer;
  project?: Project;
  total: number;
  formData: OfferingFormData;
  formValid: boolean;
  updateMode?: boolean;
  extraComponent?: React.ComponentType<any>;
}
