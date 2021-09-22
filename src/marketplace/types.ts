import { InjectedFormProps } from 'redux-form';

import { GeolocationPoint } from '@waldur/map/types';
import { OrderItemDetailsType } from '@waldur/marketplace/orders/types';
import { Project, Customer } from '@waldur/workspace/types';

export type BillingPeriod = 'hour' | 'day' | 'half_month' | 'month';

export interface BaseComponent {
  type: string;
  name: string;
  measured_unit: string;
  description: string;
}

export type BillingType = 'usage' | 'limit' | 'fixed' | 'one' | 'few';

export interface OfferingComponent extends BaseComponent {
  billing_type: BillingType;
  limit_period?: 'month' | 'total';
  limit_amount?: number;
  max_value?: number;
  min_value?: number;
  factor?: number;
  is_boolean?: boolean;
  default_limit?: number;
  article_code?: string;
}

export interface Plan {
  url: string;
  uuid?: string;
  name: string;
  description: string;
  unit_price: number | string;
  init_price?: number | string;
  switch_price?: number | string;
  unit: BillingPeriod;
  quotas: { [key: string]: number };
  prices: { [key: string]: number };
  is_active: boolean;
  archived: boolean;
  minimal_price: number;
  plan_type: string;
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
  options: { [key: string]: OptionField };
}

export interface ComparedOffering {
  name: string;
  attributes: AttributesType;
}

interface Quota {
  name: string;
  limit: number;
  usage: number;
}

interface ReferredPids {
  resource_type: string;
  title: string;
  published: string;
  publisher: string;
  pid: string;
  relation_type: string;
}

type OfferingState = 'Draft' | 'Active' | 'Paused' | 'Archived';

interface OfferingGoogleCalendar {
  backend_id: string;
  http_link: string;
  public: boolean;
}

export interface Division {
  uuid: string;
  name: string;
  type: string;
  url: string;
}

export interface Offering extends GeolocationPoint {
  quotas?: Quota[];
  uuid?: string;
  url?: string;
  thumbnail: string;
  name: string;
  backend_id?: string;
  terms_of_service?: string;
  terms_of_service_link?: string;
  privacy_policy_link?: string;
  rating: number;
  order_item_count: number;
  reviews: number;
  category?: string;
  category_title?: string;
  category_uuid?: string;
  vendor_details?: string;
  screenshots?: Image[];
  description?: string;
  full_description: string;
  customer_uuid?: string;
  customer_name?: string;
  customer_image?: string;
  attributes: AttributesType;
  components: OfferingComponent[];
  options?: OfferingOptions;
  plugin_options?: Record<string, any>;
  secret_options?: Record<string, any>;
  plans?: Plan[];
  type: string;
  state: OfferingState;
  scope?: string;
  scope_uuid?: string;
  created?: string;
  shared?: boolean;
  billable?: boolean;
  paused_reason?: string;
  datacite_doi?: string;
  citation_count?: number;
  referred_pids: ReferredPids[];
  google_calendar_is_public: boolean;
  google_calendar_link?: string;
  googlecalendar?: OfferingGoogleCalendar;
  divisions: Division[];
}

export interface Image {
  image: string;
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
  | 'html';

export interface Attribute {
  default?: any;
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
  widget?: 'csv' | 'filesize' | 'attached_instance';
}

export interface Category {
  url: string;
  uuid?: string;
  title: string;
  icon: string;
  offering_count: number;
  sections?: Section[];
  columns?: CategoryColumn[];
  components?: BaseComponent[];
}

export interface CategoryComponentUsage {
  date: string;
  reported_usage: number;
  fixed_usage: number;
  category_uuid: string;
  category_title: string;
  name: string;
  type: string;
  measured_unit: string;
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
  customer_uuid: string;
  customer_name: string;
  name: string;
  uuid: string;
  image?: string;
  customer_image?: string;
  description?: string;
  service_offerings?: Offering[];
  created: string;
  customer_abbreviation?: string;
  country?: string;
  division?: string;
}

export interface OfferingConfigurationFormProps extends InjectedFormProps {
  offering: Offering;
  project?: Project;
  plan?: Plan;
  initialAttributes?: AttributesType;
  initialLimits?: AttributesType;
  customer?: Customer;
  limits: string[];
  previewMode?: boolean;
}

export interface OrderItemDetailsProps {
  orderItem: OrderItemDetailsType;
  offering: Offering;
  limits?: string[];
}

export interface AttributesType {
  [key: string]: any;
}

interface PluginComponent {
  billing_type: BillingType;
  measured_unit: string;
  type: string;
  name: string;
}

export interface PluginMetadata {
  offering_type: string;
  available_limits: string[];
  components: PluginComponent[];
}

export interface ImportableResource {
  backend_id: string;
  name: string;
}
