import { Customer } from '@waldur/customer/types';

export interface GeolocationPoint {
  latitude: number;
  longitude: number;
}

export type Geolocations = GeolocationPoint[];

export interface Product {
  uuid?: string;
  thumb: string;
  name: string;
  offering_name?: string;
  subtitle: string;
  rating: number;
  installs: number;
  reviews: number;
  category?: string;
  category_title?: string;
  vendor: string;
  vendor_details?: string;
  cloudDeploymentModel?: string;
  vendorType?: string;
  userSupportOptions?: string[];
  interfaceOptions?: string[];
  metricsReporting?: string[];
  dataProtectionInternal?: string;
  dataProtectionExternal?: string;
  userAuth?: string;
  managementAuth?: string;
  securityCertifications?: string;
  pricingOption?: string;
  price: number;
  screenshots?: Screenshot[];
  description?: string;
  geolocations?: Geolocations;
  customer_uuid?: string;
  customer_name?: string;
}

export interface Screenshot {
  thumb: string;
  title: string;
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

export interface ProductsListType {
  items: Product[];
  loaded: boolean;
  loading: boolean;
}

export interface Provider extends Customer {
  logo?: string;
  description?: string;
  service_offerings?: Product[];
}
