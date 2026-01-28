import { BillingUnit } from 'waldur-js-client';

import { PlanFormData, OptionFormData } from './types';

export const formatPlan = (plan: PlanFormData) => ({
  name: plan.name,
  unit: plan.unit.value as BillingUnit,
  unit_price: plan.unit_price ? String(plan.unit_price) : undefined,
  article_code: plan.article_code,
  description: plan.description,
});

export const formatOption = (option: OptionFormData) => {
  const {
    type,
    choices,
    cascade_config,
    component_multiplier_config,
    default_configs,
    ...rest
  } = option;
  const item: any = {
    type: type.value,
    ...rest,
  };

  // Split comma-separated list, strip spaces, omit empty items
  if (choices) {
    item.choices = choices
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .sort();
  }

  // Handle cascade_config for conditional_cascade type
  if (cascade_config && item.type === 'conditional_cascade') {
    item.cascade_config = cascade_config;
  }

  // Handle component_multiplier_config for component_multiplier type
  if (component_multiplier_config && item.type === 'component_multiplier') {
    item.component_multiplier_config = component_multiplier_config;
  }

  // Handle default_configs for K8s config types
  if (
    default_configs &&
    (item.type === 'single_datacenter_k8s_config' ||
      item.type === 'multi_datacenter_k8s_config')
  ) {
    item.default_configs = default_configs;
  }

  // Handle validators for cross-field validation
  if (rest.validators && Array.isArray(rest.validators)) {
    const validValidators = rest.validators.filter(
      (v) => v.type && v.target_field,
    );
    if (validValidators.length > 0) {
      item.validators = validValidators.map((v) => ({
        type: typeof v.type === 'object' ? v.type.value : v.type,
        target_field:
          typeof v.target_field === 'object'
            ? v.target_field.value
            : v.target_field,
      }));
    }
  }

  return item;
};

export const formatAttribute = (attribute, value) => {
  if (attribute.type === 'list' && Array.isArray(value)) {
    if (value.length === 0) {
      return undefined;
    } else {
      return value.map((item) => item.key);
    }
  } else if (attribute.type === 'choice' && typeof value !== 'undefined') {
    if (value === '') {
      return undefined;
    } else {
      return value.key;
    }
  }
  return value;
};

const getBillingTypeValue = (option) =>
  typeof option === 'object' ? option.value : option;

export const formatComponent = (component) => ({
  ...component,
  billing_type: getBillingTypeValue(component.billing_type),
  limit_period: component.limit_period ? component.limit_period.value : null,
  uuid: component.uuid,
});
