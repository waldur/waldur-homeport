import { Offering, Plan } from '@waldur/marketplace/types';
import { Project } from '@waldur/workspace/types';

import { PricesData } from './plan/types';

export interface Limits {
  [key: string]: number;
}

export interface OfferingFormData {
  plan?: Plan;
  attributes?: { [key: string]: any };
  project?: Project;
  limits?: Limits;
  customer?: any;
}

export interface OrderSummaryProps {
  offering: Offering;
  prices?: PricesData;
  formData: OfferingFormData;
  formValid?: boolean;
  errors?: any;
  updateMode?: boolean;
  extraComponent?: React.ComponentType<any>;
  shouldConcealPrices?: boolean;
}
export interface PureOfferingConfiguratorProps {
  offering: Offering;
  project?: Project;
  plan?: Plan;
  limits: string[];
}
