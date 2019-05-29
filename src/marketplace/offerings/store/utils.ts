import { omit } from '@waldur/core/utils';
import { Customer } from '@waldur/customer/types';
import { OptionField, Category, Attribute } from '@waldur/marketplace/types';

import { OfferingRequest, OfferingFormData, PlanRequest, PlanFormData, OptionFormData } from './types';

export const planWithoutComponent = (plan: PlanFormData, component: string) => ({
  ...plan,
  prices: plan.prices ? omit(plan.prices, component) : plan.prices,
  quotas: plan.quotas ? omit(plan.quotas, component) : plan.quotas,
});

export const planWithoutQuotas = (plan: PlanFormData, component: string) => ({
  ...plan,
  quotas: plan.quotas ? omit(plan.quotas, component) : plan.quotas,
});

const formatPlan = (plan: PlanFormData, fixedComponents: string[]): PlanRequest => {
  const result: PlanRequest = {
    name: plan.name,
    unit: plan.unit.value,
    unit_price: plan.unit_price,
  };
  if (plan.prices) {
    result.prices = plan.prices;
  }
  if (plan.quotas) {
    // Skip quotas for usage-based components
    result.quotas = Object.keys(plan.quotas).reduce(
      (acc, key) => fixedComponents.includes(key) ? {...acc, [key]: plan.quotas[key]} : acc,
      {});
  }
  if (plan.description) {
    result.description = plan.description;
  }
  if (plan.uuid) {
    result.uuid = plan.uuid;
  }
  return result;
};

const formatOptions = (options: OptionFormData[]) => ({
  order: options.map(option => option.name),
  options: options.reduce((result, option) => {
    const {name, type, choices, ...rest} = option;
    const item: OptionField = {
      type: type.value,
      ...rest,
    };
    // Split comma-separated list, strip spaces, omit empty items
    if (choices) {
      item.choices = choices.split(',').map(s => s.trim()).filter(s => s.length > 0).sort();
    }
    return {
      ...result,
      [name]: item,
    };
  }, {}),
});

export const formatAttributes = (category: Category, attributes) => {
  const attributeMap = {};
  for (const section of category.sections) {
    for (const attr of section.attributes) {
      attributeMap[attr.key] = attr;
    }
  }
  return Object.keys(attributeMap).reduce((result, key) => {
    const meta: Attribute = attributeMap[key];
    let value = attributes[key];
    if (meta.type === 'list' && Array.isArray(value)) {
      if (value.length === 0) {
        value = undefined;
      } else {
        value = value.map(item => item.key);
      }
    } else if (meta.type === 'choice') {
      if (value === '') {
        value = undefined;
      }
    }
    return {
      ...result,
      [key]: value,
    };
  }, {});
};

export const formatComponents = components =>
  components.map(component => ({
    ...component,
    billing_type:
      typeof component.billing_type === 'object' ?
      component.billing_type.value :
      component.billing_type,
    limit_period: component.limit_period ? component.limit_period.value : null,
  }));

export const formatOfferingRequest = (request: OfferingFormData, customer?: Customer, skipComponents?: boolean) => {
  const result: OfferingRequest = {
    name: request.name,
    native_name: request.native_name,
    description: request.description,
    native_description: request.native_description,
    full_description: request.full_description,
    terms_of_service: request.terms_of_service,
    category: request.category.url,
    customer: customer ? customer.url : undefined,
    type: request.type ? request.type.value : undefined,
    service_attributes: request.service_settings,
    shared: true,
  };
  if (request.attributes) {
    result.attributes = formatAttributes(request.category, request.attributes);
  }
  if (request.components && !skipComponents) {
    result.components = formatComponents(request.components);
  }
  const fixedComponents = request.components.filter(c => c.billing_type === 'fixed').map(c => c.type);
  if (request.plans) {
    result.plans = request.plans.map(plan => formatPlan(plan, fixedComponents));
  }
  if (request.options) {
    result.options = formatOptions(request.options);
  }
  if (request.scope) {
    result.scope = request.scope;
  }
  return result;
};
