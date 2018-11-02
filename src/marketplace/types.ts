import { InjectedFormProps } from 'redux-form';

import { OrderItemResponse } from '@waldur/marketplace/orders/types';
import { Offering } from '@waldur/marketplace/types';
import { Project } from '@waldur/workspace/types';

export type BillingPeriod =
  | 'day'
  | 'half_month'
  | 'month'
  ;

export interface GeolocationPoint {
  latitude: number;
  longitude: number;
}

export type Geolocations = GeolocationPoint[];

export interface OfferingComponent {
  billing_type: 'usage' | 'fixed';
  type: string;
  name: string;
  measured_unit: string;
}

export interface Plan {
  url: string;
  name: string;
  description: string;
  unit_price: string;
  unit: BillingPeriod;
  quotas: {[key: string]: number};
  prices: {[key: string]: number};
}

export interface OptionField {
  type?: string;
  label: string;
  help_text?: string;
  required?: boolean;
  choices?: string[];
  default?: boolean | string | number;
  min?: number;
  max?: number;
}

export interface OfferingOptions {
  order: string[];
  options: {[key: string]: OptionField};
}

export interface ComparedOffering {
  name: string;
  attributes: AttributesType;
}

export interface Offering {
  uuid?: string;
  thumbnail: string;
  name: string;
  rating: number;
  order_item_count: number;
  reviews: number;
  category?: string;
  category_title?: string;
  category_uuid?: string;
  vendor_details?: string;
  screenshots?: Screenshot[];
  description?: string;
  full_description: string;
  geolocations?: Geolocations;
  customer_uuid?: string;
  customer_name?: string;
  attributes: AttributesType;
  components: OfferingComponent[];
  options?: OfferingOptions;
  plans?: Plan[];
  type: string;
  state: string;
}

export interface Screenshot {
  thumbnail: string;
  name: string;
  description: string;
}

type AttributeType =
  | 'boolean'
  | 'string'
  | 'integer'
  | 'choice'
  | 'list'
  | 'password'
  ;

export interface Attribute {
  title: string;
  key: string;
  type: AttributeType;
  options?: AttributeOption[];
  required?: boolean;
}

interface AttributeOption {
  key: string;
  title: string;
}

export interface Section {
  title: string;
  attributes: Attribute[];
  is_standalone?: boolean;
}

export interface CategoryColumn {
  index: number;
  title: string;
  attribute?: string;
  widget?: string;
}

export interface Category {
  url: string;
  uuid?: string;
  title: string;
  icon: string;
  offering_count: number;
  sections?: Section[];
  columns?: CategoryColumn[];
}

export interface CategoriesListType {
  items: Category[];
  loaded: boolean;
  loading: boolean;
}

export interface OfferingsListType {
  items: Offering[];
  loaded: boolean;
  loading: boolean;
}

export interface ServiceProvider {
  uuid: string;
  image?: string;
  description?: string;
  service_offerings?: Offering[];
  created: string;
}

export interface OfferingConfigurationFormProps extends InjectedFormProps {
  offering: Offering;
  project?: Project;
}

export interface OfferingDetailsProps {
  orderItem: OrderItemResponse;
  offering: Offering;
}

export interface AttributesType {
  [key: string]: any;
}
