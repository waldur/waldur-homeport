import { Customer } from '@waldur/customer/types';

export interface GeolocationPoint {
  latitude: number;
  longitude: number;
}

export type Geolocations = GeolocationPoint[];

export interface Offering {
  uuid?: string;
  thumbnail: string;
  name: string;
  subtitle: string;
  rating: number;
  order_item_count: number;
  reviews: number;
  category?: string;
  category_title?: string;
  category_uuid?: string;
  vendor: string;
  vendor_details?: string;
  price: number;
  screenshots?: Screenshot[];
  description?: string;
  geolocations?: Geolocations;
  customer_uuid?: string;
  customer_name?: string;
  attributes?: {};
}

export interface Screenshot {
  thumbnail: string;
  name: string;
  description: string;
}

export interface Attribute {
  title: string;
  key: string;
  render?: React.SFC<any>;
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
