import { ComponentType, LazyExoticComponent } from 'react';
import {
  Project,
  Customer,
  ProviderPlanDetails as Plan,
  Offering,
  OfferingComponent,
} from 'waldur-js-client';

import { CheckoutSummaryProps } from '../deploy/types';
import { OfferingEditPanelProps } from '../offerings/update/integration/types';
import { AttributesType, OrderDetailsProps } from '../types';

export type Limits = Record<string, number>;

export type LimitParser = (limits: Limits) => Limits;

export interface OfferingConfiguration<
  AttributesType = any,
  RequestPayloadType = any,
> {
  type: string;
  orderFormComponent?: LazyExoticComponent<
    ComponentType<OrderFormComponentProps>
  >;
  userManagementSection?: LazyExoticComponent<
    ComponentType<OfferingEditPanelProps>
  >;
  provisioningConfigSection?: LazyExoticComponent<
    ComponentType<OfferingEditPanelProps>
  >;
  credentialsSection?: LazyExoticComponent<
    ComponentType<OfferingEditPanelProps>
  >;
  detailsComponent?: LazyExoticComponent<ComponentType<OrderDetailsProps>>;
  checkoutSummaryComponent?: LazyExoticComponent<
    ComponentType<CheckoutSummaryProps>
  >;
  serializer?: (
    attributes: AttributesType,
    offering: Offering,
  ) => RequestPayloadType;
  limitSerializer?: LimitParser;
  limitParser?: LimitParser;
  pluginOptionsSerializer?: (formData) => any;
  secretOptionsSerializer?: (formData) => any;
  label: string;
  showComponents?: boolean;
  onlyOnePlan?: boolean;
  disableOfferingCreation?: boolean;
  schedulable?: boolean;

  offeringComponentsFilter?: (
    formData: any,
    components: OfferingComponent[],
  ) => OfferingComponent[];
}
export interface DeployFormData {
  project?: Pick<Project, 'uuid' | 'name' | 'start_date' | 'end_date' | 'url'>;
  customer?: Pick<
    Customer,
    | 'uuid'
    | 'name'
    | 'url'
    | 'payment_profiles'
    | 'display_billing_info_in_projects'
  >;
  offering?;
  attributes?: AttributesType;
  limits?: Limits;
  plan?: Plan;
  start_date?: string;
  attachment?: any;
}

export interface OrderFormComponentProps {
  offering: Offering;
  selectedOffering: Offering;
}
