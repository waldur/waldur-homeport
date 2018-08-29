import * as React from 'react';

import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

const REGISTRY = {};

interface OfferingConfiguration<FormDataType = any, RequestPaylodType = any> {
  type: string;
  component: React.ComponentType<OfferingConfigurationFormProps>;
  serializer?: (data: FormDataType) => RequestPaylodType;
}

export function registerOfferingType(config: OfferingConfiguration) {
  REGISTRY[config.type] = {
    component: config.component,
    serializer: config.serializer,
  };
}

export function getFormComponent(offeringType) {
  return REGISTRY[offeringType].component;
}

export function getFormSerializer(offeringType) {
  return REGISTRY[offeringType].serializer || (x => x);
}
