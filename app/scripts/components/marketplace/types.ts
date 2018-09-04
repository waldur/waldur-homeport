import { InjectedFormProps } from 'redux-form';

import { Customer } from '@waldur/customer/types';
import { Offering } from '@waldur/marketplace/types';

export interface GeolocationPoint {
  latitude: number;
  longitude: number;
}

export type Geolocations = GeolocationPoint[];

export interface Plan {
  url: string;
  name: string;
  description: string;
  unit_price: number;
  unit: string;
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
  attributes?: {};
  options?: OfferingOptions;
  plans?: Plan[];
  type: string;
}

export interface Screenshot {
  thumbnail: string;
  name: string;
  description: string;
}

export interface Attribute {
  title: string;
  key: string;
  type: string;
  render?: React.SFC<any>;
  options?: AttributeOption[];
}

interface AttributeOption {
  key: string;
  title: string;
}

export interface Section {
  title: string;
  attributes: Attribute[];
  is_standalone: boolean;
}

export interface Category {
  uuid?: string;
  title: string;
  icon: string;
  offering_count: number;
  sections?: Section[];
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

export interface Provider extends Customer {
  logo?: string;
  description?: string;
  service_offerings?: Offering[];
}

export interface OfferingConfigurationFormProps extends InjectedFormProps {
  offering: Offering;
}

export interface PlanComponent {
  type: string;
  label: string;
  units: string;
}
