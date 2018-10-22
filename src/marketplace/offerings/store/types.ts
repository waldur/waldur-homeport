import { Option } from '@waldur/marketplace/common/registry';
import { AttributesType, Category, OfferingComponent, OfferingOptions } from '@waldur/marketplace/types';

export interface PlanFormData {
  name: string;
  unit: Option;
  unit_price: number;
  prices: {[key: string]: number};
  quotas: {[key: string]: number};
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
  components?: OfferingComponent[];
  plans?: PlanFormData[];
  options?: OptionFormData[];
  service_settings?: any;
  thumbnail?: File;
  scope?: string;
}

export interface PlanRequest {
  name: string;
  unit: string;
  unit_price: number;
  quotas?: {[key: string]: number};
  prices?: {[key: string]: number};
}

export interface OfferingRequest {
  name: string;
  type: string;
  customer: string;
  category: string;
  attributes?: AttributesType;
  components?: OfferingComponent[];
  plans?: PlanRequest[];
  options?: OfferingOptions;
  scope?: string;
}
