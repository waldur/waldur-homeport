import { Option } from '@waldur/marketplace/common/registry';
import {
  AttributesType,
  Category,
  OfferingComponent,
  OfferingOptions,
} from '@waldur/marketplace/types';

export interface PlanFormData {
  archived: boolean;
  name: string;
  unit: Option;
  unit_price: number;
  prices: { [key: string]: number };
  quotas: { [key: string]: number };
  description?: string;
  article_code?: string;
  product_code?: string;
  uuid?: string;
}

export interface OptionFormData {
  name: string;
  label: string;
  type: Option;
  choices: string;
}

export interface ScheduleFormData {
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  type: string;
  title: string;
  id: string;
}

export type OfferingLimits = Record<string, { min: number; max: number }>;

export interface OfferingFormData {
  name: string;
  native_name?: string;
  description?: string;
  native_description?: string;
  full_description?: string;
  terms_of_service?: string;
  category: Category;
  type: Option;
  attributes?: AttributesType;
  components?: OfferingComponent[];
  plans?: PlanFormData[];
  options?: OptionFormData[];
  schedules?: ScheduleFormData[];
  plugin_options?: Record<string, any>;
  secret_options?: Record<string, any>;
  service_settings?: any;
  thumbnail?: File;
  scope?: string;
  document?: OfferingDocument;
  limits?: OfferingLimits;
}

export interface OfferingUpdateFormData extends OfferingFormData {
  offeringUuid: string;
}

export interface PlanRequest {
  name: string;
  unit: string;
  unit_price: number;
  quotas?: { [key: string]: number };
  prices?: { [key: string]: number };
  description?: string;
  article_code?: string;
  product_code?: string;
  uuid?: string;
}

export interface OfferingRequest {
  name: string;
  native_name?: string;
  description?: string;
  native_description?: string;
  full_description?: string;
  terms_of_service?: string;
  type: string;
  customer: string;
  category: string;
  attributes?: AttributesType;
  components?: OfferingComponent[];
  plans?: PlanRequest[];
  options?: OfferingOptions;
  plugin_options?: Record<string, any>;
  secret_options?: Record<string, any>;
  schedules?: ScheduleFormData[];
  scope?: string;
  service_attributes?: any;
  shared: boolean;
  limits?: OfferingLimits;
}

export interface OfferingDocument {
  file: File;
  name?: string;
}
