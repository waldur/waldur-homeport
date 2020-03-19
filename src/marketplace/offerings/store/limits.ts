import * as React from 'react';

import {
  getFormLimitSerializer,
  getFormLimitParser,
  Limits,
  filterOfferingComponents,
} from '@waldur/marketplace/common/registry';
import { minAmount, maxAmount } from '@waldur/marketplace/common/utils';
import { Offering, OfferingComponent } from '@waldur/marketplace/types';

import { OfferingLimits } from './types';

const transformLimits = (func, limits: OfferingLimits): OfferingLimits => {
  const minValues = func(
    Object.keys(limits).reduce(
      (rv, key) => ({
        ...rv,
        [key]: limits[key].min,
      }),
      {},
    ),
  );

  const maxValues = func(
    Object.keys(limits).reduce(
      (rv, key) => ({
        ...rv,
        [key]: limits[key].max,
      }),
      {},
    ),
  );

  return Object.keys(limits).reduce(
    (rv, key) => ({
      ...rv,
      [key]: {
        min: minValues[key],
        max: maxValues[key],
      },
    }),
    {},
  );
};

export const serializeLimitValues = (
  type: string,
  limits: OfferingLimits,
): OfferingLimits => {
  const limitSerializer = getFormLimitSerializer(type);
  return transformLimits(limitSerializer, limits);
};

const parseLimitValues = (
  type: string,
  limits: OfferingLimits,
): OfferingLimits => {
  const limitParser = getFormLimitParser(type);
  return transformLimits(limitParser, limits);
};

const parseComponentLimits = (components: OfferingComponent[]) =>
  components.reduce(
    (result, component) => ({
      ...result,
      [component.type]: {
        min: component.min_value,
        max: component.max_value,
      },
    }),
    {},
  );

export const parseOfferingLimits = (offering: Offering): OfferingLimits => {
  const components = filterOfferingComponents(offering);
  const rawLimits = parseComponentLimits(components);
  return parseLimitValues(offering.type, rawLimits);
};

export const getDefaults = (offering: Offering) => {
  const limits = parseOfferingLimits(offering);
  return Object.keys(limits).reduce(
    (rv, key) => ({
      ...rv,
      [key]: limits[key].min,
    }),
    {},
  );
};

export const getOfferingComponentValidator = (component: OfferingComponent) =>
  React.useMemo(() => {
    const validators = [];
    if (component.min_value) {
      validators.push(minAmount(component.min_value));
    }
    if (component.max_value) {
      validators.push(maxAmount(component.max_value));
    }
    return validators;
  }, [component.min_value, component.max_value]);

export const getResourceComponentValidator = (limits: Limits) =>
  React.useMemo(() => {
    const validators = [];
    if (limits.min) {
      validators.push(minAmount(limits.min));
    }
    if (limits.max) {
      validators.push(maxAmount(limits.max));
    }
    return validators;
  }, [limits.min, limits.max]);
