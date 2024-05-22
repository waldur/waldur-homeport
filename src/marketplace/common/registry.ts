import {
  Offering,
  Attribute,
  OrderDetailsProps,
  OfferingComponent,
} from '@waldur/marketplace/types';

import { CheckoutSummaryProps } from '../deploy/types';

const REGISTRY: { [key: string]: Omit<OfferingConfiguration, 'type'> } = {};

export type Limits = Record<string, number>;

export type LimitParser = (limits: Limits) => Limits;

interface OfferingConfiguration<
  AttributesType = any,
  RequestPayloadType = any,
> {
  type: string;
  /**
   *  Please use only lazy component here to enable code-splitting.
   */
  orderFormComponent?: React.ComponentType<any>;
  /**
   *  Please use only lazy component here to enable code-splitting.
   */
  pluginOptionsForm?: React.ComponentType<any>;
  /**
   *  Please use only lazy component here to enable code-splitting.
   */
  secretOptionsForm?: React.ComponentType<any>;
  /**
   *  Please use only lazy component here to enable code-splitting.
   */
  detailsComponent?: React.ComponentType<OrderDetailsProps>;
  /**
   *  Please use only lazy component here to enable code-splitting.
   */
  checkoutSummaryComponent?: React.ComponentType<CheckoutSummaryProps>;
  serializer?: (
    attributes: AttributesType,
    offering: Offering,
  ) => RequestPayloadType;
  limitSerializer?: LimitParser;
  limitParser?: LimitParser;
  label: string;
  showOptions?: boolean;
  showComponents?: boolean;
  onlyOnePlan?: boolean;
  providerType?: string;
  attributes?(): Attribute[];
  optionsSummary?(): Attribute[];
  disableOfferingCreation?: boolean;
  schedulable?: boolean;
  showBackendId?: boolean;
  allowToUpdateService?: boolean;
  offeringComponentsFilter?: (
    formData: any,
    components: OfferingComponent[],
  ) => OfferingComponent[];
}

export interface Option {
  value: string;
  label: string;
}

export function registerOfferingType(config: OfferingConfiguration) {
  const { type, ...rest } = config;
  REGISTRY[type] = rest;
}

export function getOrderFormComponent(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].orderFormComponent
  );
}

export function getDetailsComponent(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].detailsComponent
  );
}

export function getFormSerializer(offeringType: string) {
  return (
    (REGISTRY.hasOwnProperty(offeringType) &&
      REGISTRY[offeringType].serializer) ||
    ((x) => x)
  );
}

export function getFormLimitSerializer(offeringType: string) {
  return (
    (REGISTRY.hasOwnProperty(offeringType) &&
      REGISTRY[offeringType].limitSerializer) ||
    ((x) => x)
  );
}

export function getFormLimitParser(offeringType: string) {
  return (
    (REGISTRY.hasOwnProperty(offeringType) &&
      REGISTRY[offeringType].limitParser) ||
    ((x) => x)
  );
}

export function getCheckoutSummaryComponent(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].checkoutSummaryComponent
  );
}

export function getOfferingTypes(): Option[] {
  return Object.keys(REGISTRY)
    .map((key) => ({
      value: key,
      label: REGISTRY[key].label,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getCreatableOfferings(): Option[] {
  const keys = Object.keys(REGISTRY).filter(
    (key) => !REGISTRY[key].disableOfferingCreation,
  );
  return keys
    .map((key) => ({
      value: key,
      label: REGISTRY[key].label,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function showOfferingOptions(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) && REGISTRY[offeringType].showOptions
  );
}

export function showBackendId(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].showBackendId
  );
}

export function allowToUpdateService(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].allowToUpdateService
  );
}

export function hidePlanAddButton(offeringType: string, fields: Array<any>) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].onlyOnePlan &&
    fields.length
  );
}

export function isOfferingTypeSchedulable(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) && REGISTRY[offeringType].schedulable
  );
}

export function getPluginOptionsForm(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].pluginOptionsForm
  );
}

export function getSecretOptionsForm(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].secretOptionsForm
  );
}

export function showComponentsList(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].showComponents
  );
}

export function getProviderType(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) && REGISTRY[offeringType].providerType
  );
}

export function getLabel(offeringType: string) {
  return (
    (REGISTRY.hasOwnProperty(offeringType) && REGISTRY[offeringType].label) ||
    offeringType
  );
}

export function getAttributes(offeringType: string) {
  const func =
    REGISTRY.hasOwnProperty(offeringType) && REGISTRY[offeringType].attributes;
  return func ? func() : [];
}

export function getOptionsSummary(offeringType: string) {
  const func =
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].optionsSummary;
  return func ? func() : [];
}

function getOfferingComponentsFilter(offeringType: string) {
  return (
    REGISTRY.hasOwnProperty(offeringType) &&
    REGISTRY[offeringType].offeringComponentsFilter
  );
}

export const filterOfferingComponents = (
  offering: Offering,
): OfferingComponent[] => {
  let offeringComponents: OfferingComponent[] = offering.components;
  const offeringComponentsFilter = getOfferingComponentsFilter(offering.type);
  if (offeringComponentsFilter) {
    offeringComponents = offeringComponentsFilter(offering, offeringComponents);
  }
  return offeringComponents;
};
