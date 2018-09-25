import { Offering, Plan } from '@waldur/marketplace/types';
import { Customer, Project } from '@waldur/workspace/types';

import { OfferingFormData } from './types';

export interface Limits {
  [key: string]: number;
}

export interface OfferingFormData {
  plan?: Plan;
  attributes?: {[key: string]: any};
  limits?: Limits;
}

export interface OrderSummaryProps {
  offering: Offering;
  customer: Customer;
  project?: Project;
  total: number;
  formData: OfferingFormData;
  formValid: boolean;
}

export interface Component {
  type: string;
  billing_type: 'usage' | 'fixed';
  label: string;
  units: string;
  amount: number;
  prices: number[];
  subTotal: number;
}

export interface PricesData {
  components: Component[];
  periods: string[];
  total: number;
  totalPeriods: number[];
}
