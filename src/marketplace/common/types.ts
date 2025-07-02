import { ComponentType, LazyExoticComponent } from 'react';
import {
  Project,
  Customer,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';

import { CheckoutSummaryProps } from '../deploy/types';
import { OfferingEditPanelFormProps } from '../offerings/update/integration/types';
import {
  AttributesType,
  Offering,
  OfferingComponent,
  OrderDetailsProps,
} from '../types';

export type Limits = Record<string, number>;

export type LimitParser = (limits: Limits) => Limits;

export interface OfferingConfiguration<
  AttributesType = any,
  RequestPayloadType = any,
> {
  type: string;
  orderFormComponent?: LazyExoticComponent<ComponentType<any>>;
  pluginOptionsForm?: LazyExoticComponent<
    ComponentType<OfferingEditPanelFormProps>
  >;
  secretOptionsForm?: LazyExoticComponent<
    ComponentType<OfferingEditPanelFormProps>
  >;
  provisioningConfigForm?: LazyExoticComponent<
    ComponentType<OfferingEditPanelFormProps>
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
  providerType?: string;
  disableOfferingCreation?: boolean;
  schedulable?: boolean;
  showBackendId?: boolean;
  allowToUpdateService?: boolean;
  offeringComponentsFilter?: (
    formData: any,
    components: OfferingComponent[],
  ) => OfferingComponent[];
}
export interface DeployFormData {
  project?: Pick<Project, 'uuid' | 'name' | 'end_date' | 'url'>;
  customer?: Pick<Customer, 'uuid' | 'name' | 'url' | 'payment_profiles'>;
  offering?;
  attributes?: AttributesType;
  limits?: Limits;
  plan?: Plan;
}
