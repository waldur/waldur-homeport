import * as React from 'react';

import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';
import { Offering } from '@waldur/offering/types';

const REGISTRY = {};

interface OfferingConfiguration<AttributesType = any, RequestPaylodType = any> {
  type: string;
  component: React.ComponentType<OfferingConfigurationFormProps>;
  serializer?: (attributes: AttributesType, offering: Offering) => RequestPaylodType;
  label: string;
}

export function registerOfferingType(config: OfferingConfiguration) {
  REGISTRY[config.type] = {
    component: config.component,
    serializer: config.serializer,
    label: config.label,
  };
}

export function getFormComponent(offeringType) {
  return REGISTRY[offeringType].component;
}

export function getFormSerializer(offeringType) {
  return REGISTRY[offeringType].serializer || (x => x);
}

export function getOfferingTypes() {
  return Object.keys(REGISTRY).map(key => ({
    value: key,
    label: REGISTRY[key].label,
  }));
}
