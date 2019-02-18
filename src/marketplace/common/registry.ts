import * as React from 'react';
import { Omit } from 'react-redux';

import { Offering, Attribute, OrderItemDetailsProps, OfferingConfigurationFormProps } from '@waldur/marketplace/types';

const REGISTRY: {[key: string]: Omit<OfferingConfiguration, 'type'>} = {};

interface OfferingConfiguration<AttributesType = any, RequestPaylodType = any> {
  type: string;
  component: React.ComponentType<OfferingConfigurationFormProps>;
  detailsComponent?: React.ComponentType<OrderItemDetailsProps>;
  checkoutSummaryComponent?: any;
  serializer?: (attributes: AttributesType, offering: Offering) => RequestPaylodType;
  label: string;
  showOptions?: boolean;
  showComponents?: boolean;
  providerType?: string;
  attributes?(): Attribute[];
  disableOfferingCreation?: boolean;
}

export interface Option {
  value: string;
  label: string;
}

export function registerOfferingType(config: OfferingConfiguration) {
  const {type, ...rest} = config;
  REGISTRY[type] = rest;
}

export function getFormComponent(offeringType) {
  return REGISTRY[offeringType].component;
}

export function getDetailsComponent(offeringType) {
  return REGISTRY[offeringType].detailsComponent;
}

export function getFormSerializer(offeringType) {
  return REGISTRY[offeringType].serializer || (x => x);
}

export function getCheckoutSummaryComponent(offeringType) {
  return REGISTRY[offeringType].checkoutSummaryComponent;
}

export function getOfferingTypes(): Option[] {
  const keys = Object.keys(REGISTRY).filter(key => !REGISTRY[key].disableOfferingCreation);
  return keys.map(key => ({
    value: key,
    label: REGISTRY[key].label,
  }));
}

export function showOfferingOptions(offeringType) {
  return REGISTRY[offeringType].showOptions;
}

export function showComponentsList(offeringType) {
  return REGISTRY[offeringType].showComponents;
}

export function getProviderType(offeringType) {
  return REGISTRY[offeringType].providerType;
}

export function getLabel(offeringType) {
  return REGISTRY[offeringType].label;
}

export function getAttributes(offeringType) {
  const func = REGISTRY[offeringType].attributes;
  return func ? func() : [];
}
