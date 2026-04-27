import { PublicOfferingDetails } from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { Offering, Plan } from '@/marketplace/types';

import { DeployFormData } from '../common/types';

import { PricesData } from './plan/types';

export interface Limits {
  [key: string]: number;
}

export interface OrderSummaryProps {
  offering: PublicOfferingDetails;
  prices?: PricesData;
  formData: DeployFormData;
  formValid?: boolean;
  errors?: any;
  isSubmitting?: boolean;
  updateMode?: boolean;
  extraComponent?: React.ComponentType<any>;
  shouldConcealPrices?: boolean;
  onlyDetails?: boolean;
}
export interface PureOfferingConfiguratorProps {
  offering: Offering;
  project?: Project;
  plan?: Plan;
  limits: string[];
}
