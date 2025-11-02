import { CascadeConfig, ComponentMultiplierConfig } from 'waldur-js-client';

import { Option } from '@waldur/marketplace/common/registry';

export interface PlanFormData {
  archived: boolean;
  name: string;
  unit: Option;
  unit_price: number;
  prices: { [key: string]: number };
  quotas: { [key: string]: number };
  description?: string;
  article_code?: string;
  uuid?: string;
}

export interface OptionFormData {
  name: string;
  label: string;
  type: Option;
  choices: string;
  cascade_config?: CascadeConfig;
  component_multiplier_config?: ComponentMultiplierConfig;
}

export type OfferingLimits = Record<string, { min: number; max: number }>;
