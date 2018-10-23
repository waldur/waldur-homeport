import * as React from 'react';
import { Omit } from 'react-redux';

import { OfferingConfigurationFormProps, Attribute } from '@waldur/marketplace/types';
import { Offering } from '@waldur/marketplace/types';

const REGISTRY: {[key: string]: Omit<OfferingConfiguration, 'type'>} = {};

interface OfferingConfiguration<AttributesType = any, RequestPaylodType = any> {
  type: string;
  component: React.ComponentType<OfferingConfigurationFormProps>;
  serializer?: (attributes: AttributesType, offering: Offering) => RequestPaylodType;
  label: string;
  showOptions?: boolean;
  showComponents?: boolean;
  providerType?: string;
  attributes?(): Attribute[];
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

export function getFormSerializer(offeringType) {
  return REGISTRY[offeringType].serializer || (x => x);
}

export function getOfferingTypes(): Option[] {
  return Object.keys(REGISTRY).map(key => ({
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

export function getAttributes(offeringType) {
  const func = REGISTRY[offeringType].attributes;
  return func ? func() : [];
}
