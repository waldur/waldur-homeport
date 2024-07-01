import { InjectedFormProps } from 'redux-form';

import { GeolocationPoint } from '@waldur/map/types';
import { OrderDetailsType } from '@waldur/marketplace/orders/types';
import { Quota } from '@waldur/quotas/types';
import { Customer, Project } from '@waldur/workspace/types';

export type BillingPeriod = 'hour' | 'day' | 'half_month' | 'month';

interface BaseComponent {
  type: string;
  name: string;
  measured_unit: string;
  description: string;
}

export type BillingType = 'usage' | 'limit' | 'fixed' | 'one' | 'few';

export interface OfferingComponent extends BaseComponent {
  billing_type: BillingType;
  limit_period?: 'month' | 'annual' | 'total';
  limit_amount?: number;
  max_value?: number;
  min_value?: number;
  factor?: number;
  is_boolean?: boolean;
  default_limit?: number;
  article_code?: string;
  uuid: string;
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
  future_prices?: { [key: string]: number };
  resources_count?: number;
  is_active: boolean;
  archived: boolean;
  price: number;
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

interface OfferingOptions {
  order: string[];
  options: { [key: string]: OptionField };
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

export interface OrganizationGroup {
  uuid: string;
  name: string;
  type_name: string;
  url: string;
  parent?: string;
  parent_uuid?: string;
  parent_name?: string;
  customers_count: number;
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
  access_url?: string;
  rating: number;
  roles?: any[];
  order_count: number;
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
  project_name?: string;
  project_uuid?: string;
  attributes: AttributesType;
  components: OfferingComponent[];
  options?: OfferingOptions;
  resource_options?: OfferingOptions;
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
  image?: string;
  googlecalendar?: OfferingGoogleCalendar;
  organization_groups: OrganizationGroup[];
  parent_description?: string;
  parent_name?: string;
  getting_started?: any;
  integration_status: any;
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
  key: string;
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

export interface CategoryGroup {
  url: string;
  uuid: string;
  title: string;
  description: string;
  icon: string;
  /** generated on frontend side */
  categories?: Category[];
  offering_count: number;
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
  description?: string;
  group?: string;
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
  customer_country?: string;
  country?: string;
  organizationGroup?: string;
  url?: string;
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

export interface OrderDetailsProps {
  order: OrderDetailsType;
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

export interface OfferingPermission {
  url: string;
  pk: number;
  created: string;
  expiration_time: string;
  created_by: string;
  offering: string;
  offering_uuid: string;
  offering_name: string;
  user: string;
  user_full_name: string;
  user_native_name: string;
  user_username: string;
  user_uuid: string;
  user_email: string;
}

export interface PlanComponent {
  amount: number;
  billing_type: BillingType;
  component_name: string;
  measured_unit: string;
  offering_name: string;
  plan_name: string;
  plan_unit: string;
  price: string;
}
