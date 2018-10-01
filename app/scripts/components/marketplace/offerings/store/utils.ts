import { Customer } from '@waldur/customer/types';
import { OptionField } from '@waldur/marketplace/types';

import { OfferingRequest, OfferingFormData, PlanRequest, PlanFormData, OptionFormData } from './types';

const formatPlan = (plan: PlanFormData): PlanRequest => {
  const result: PlanRequest = {
    name: plan.name,
    unit: plan.unit.value,
    unit_price: plan.unit_price,
  };
  if (plan.fixedComponentPrices) {
    result.prices = plan.fixedComponentPrices;
    result.quotas = plan.fixedComponentQuotas;
  } else if (plan.customComponents) {
    result.custom_components = plan.customComponents.map(component => {
      const {price, amount, ...rest} = component;
      return rest;
    });
    result.prices = plan.customComponents.reduce((prices, component) => ({...prices, [component.type]: component.price}), {});
    result.quotas = plan.customComponents.reduce((prices, component) => ({...prices, [component.type]: component.amount}), {});
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

const formatAttributes = attributes => Object.keys(attributes).reduce((result, key) => {
  let value = attributes[key];
  if (Array.isArray(value)) {
    value = value.map(item => item.key);
  }
  return {
    ...result,
    [key]: value,
  };
}, {});

export const formatOfferingRequest = (request: OfferingFormData, customer: Customer) => {
  const result: OfferingRequest = {
    name: request.name,
    category: request.category.url,
    customer: customer.url,
    type: request.type.value,
  };
  if (request.attributes) {
    result.attributes = formatAttributes(request.attributes);
  }
  if (request.plans) {
    result.plans = request.plans.map(formatPlan);
  }
  if (request.options) {
    result.options = formatOptions(request.options);
  }
  return result;
};
