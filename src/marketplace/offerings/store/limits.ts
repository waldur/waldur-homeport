import { useMemo } from 'react';
import { PublicOfferingDetails } from 'waldur-js-client';

import {
  filterOfferingComponents,
  getFormLimitParser,
} from '@waldur/marketplace/common/registry';
import { Limits } from '@waldur/marketplace/common/types';
import { maxAmount, minAmount } from '@waldur/marketplace/common/utils';
import { OfferingComponent } from '@waldur/marketplace/types';

import { OfferingLimits } from './types';

const transformLimits = (func, limits: OfferingLimits): OfferingLimits => {
  const entries = Object.entries(limits);
  const minValues = func(
    Object.fromEntries(entries.map(([key, val]) => [key, val.min])),
  );
  const maxValues = func(
    Object.fromEntries(entries.map(([key, val]) => [key, val.max])),
  );

  return Object.fromEntries(
    entries.map(([key]) => [key, { min: minValues[key], max: maxValues[key] }]),
  );
};

const parseLimitValues = (
  type: string,
  limits: OfferingLimits,
): OfferingLimits => {
  const limitParser = getFormLimitParser(type);
  return transformLimits(limitParser, limits);
};

const parseComponentLimits = (
  components: OfferingComponent[],
): OfferingLimits =>
  Object.fromEntries(
    components.map((component) => [
      component.type,
      {
        min: component.min_value,
        max: component.max_value,
      },
    ]),
  );

export const parseOfferingLimits = (
  offering: PublicOfferingDetails,
): OfferingLimits => {
  const components = filterOfferingComponents(offering);
  const rawLimits = parseComponentLimits(components);
  return parseLimitValues(offering.type, rawLimits);
};

export const getOfferingComponentValidator = (component: OfferingComponent) => {
  const validators = [];
  if (component.min_value) {
    validators.push(minAmount(component.min_value));
  }
  if (component.max_value) {
    validators.push(maxAmount(component.max_value));
  }
  return validators;
};

export const getResourceComponentValidator = (limits: Limits) =>
  useMemo(() => {
    const validators = [];
    if (limits.min) {
      validators.push(minAmount(limits.min));
    }
    if (limits.max) {
      validators.push(maxAmount(limits.max));
    }
    return validators;
  }, [limits.min, limits.max]);
