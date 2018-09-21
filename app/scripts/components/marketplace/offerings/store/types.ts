import { Option } from '@waldur/marketplace/common/registry';
import { AttributesType, Category, PlanComponent, OfferingOptions } from '@waldur/marketplace/types';

export interface PlanFormData {
  name: string;
  unit: Option;
  unit_price: number;
  fixedComponentPrices: {[key: string]: number};
  fixedComponentQuotas: {[key: string]: number};
  customComponents: PlanComponent[];
}

export interface OptionFormData {
  name: string;
  label: string;
  type: Option;
  choices: string;
}

export interface OfferingFormData {
  name: string;
  category: Category;
  type: Option;
  attributes?: AttributesType;
  plans?: PlanFormData[];
  options?: OptionFormData[];
}

interface CustomPlanComponent {
  billing_type: 'usage' | 'fixed';
  type: string;
  name: string;
  measured_unit: string;
}

export interface PlanRequest {
  name: string;
  unit: string;
  unit_price: number;
  quotas?: {[key: string]: number};
  prices?: {[key: string]: number};
  custom_components?: CustomPlanComponent[];
}

export interface OfferingRequest {
  name: string;
  type: string;
  customer: string;
  category: string;
  attributes?: AttributesType;
  plans?: PlanRequest[];
  options?: OfferingOptions;
}
