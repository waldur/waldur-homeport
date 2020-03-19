import { omit, pick } from '@waldur/core/utils';
import { Customer } from '@waldur/customer/types';
import { showOfferingLimits } from '@waldur/marketplace/common/registry';
import {
  OptionField,
  Category,
  Attribute,
  OfferingComponent,
} from '@waldur/marketplace/types';

import { serializeLimitValues } from './limits';
import {
  OfferingRequest,
  OfferingFormData,
  PlanRequest,
  PlanFormData,
  OptionFormData,
} from './types';

export const planWithoutComponent = (
  plan: PlanFormData,
  component: string,
) => ({
  ...plan,
  prices: plan.prices ? omit(plan.prices, component) : plan.prices,
  quotas: plan.quotas ? omit(plan.quotas, component) : plan.quotas,
});

export const planWithoutQuotas = (plan: PlanFormData, component: string) => ({
  ...plan,
  quotas: plan.quotas ? omit(plan.quotas, component) : plan.quotas,
});

const formatPlan = (
  plan: PlanFormData,
  fixedComponents: string[],
): PlanRequest => {
  const result: PlanRequest = {
    name: plan.name,
    unit: plan.unit.value,
    unit_price: plan.unit_price,
    article_code: plan.article_code,
    product_code: plan.product_code,
  };
  if (plan.prices) {
    result.prices = plan.prices;
  }
  if (plan.quotas) {
    // Skip quotas for usage-based components
    result.quotas = Object.keys(plan.quotas).reduce(
      (acc, key) =>
        fixedComponents.includes(key)
          ? { ...acc, [key]: plan.quotas[key] }
          : acc,
      {},
    );
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
    const { name, type, choices, ...rest } = option;
    const item: OptionField = {
      type: type.value,
      ...rest,
    };
    // Split comma-separated list, strip spaces, omit empty items
    if (choices) {
      item.choices = choices
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .sort();
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
    } else if (meta.type === 'choice' && typeof value !== 'undefined') {
      if (value === '') {
        value = undefined;
      } else {
        value = value.key;
      }
    }
    return {
      ...result,
      [key]: value,
    };
  }, {});
};

const getBillingTypeValue = option =>
  typeof option === 'object' ? option.value : option;

export const formatComponents = components =>
  components.map(component => ({
    ...component,
    billing_type: getBillingTypeValue(component.billing_type),
    limit_period: component.limit_period ? component.limit_period.value : null,
  }));

export const formatOfferingRequest = (
  request: OfferingFormData,
  components: OfferingComponent[],
  customer?: Customer,
) => {
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
  if (request.components && components.length === 0) {
    // Serialize custom components only if there're no built-in components.
    result.components = formatComponents(request.components);
  }

  if (request.schedules) {
    result.attributes = {
      ...result.attributes,
      schedules: request.schedules.map(
        pick(['start', 'end', 'title', 'type', 'id']),
      ),
    };
  }

  result.plugin_options = request.plugin_options;
  result.secret_options = request.secret_options;

  if (request.plans) {
    // Pick either built-in or custom fixed components.
    const fixedComponents = (components.length > 0
      ? components
      : request.components || []
    )
      .filter(c => getBillingTypeValue(c.billing_type) === 'fixed')
      .map(c => c.type);
    result.plans = request.plans.map(plan => formatPlan(plan, fixedComponents));
  }
  if (request.options) {
    result.options = formatOptions(request.options);
  }
  if (request.scope) {
    result.scope = request.scope;
  }
  if (request.limits && request.type) {
    const showLimits = showOfferingLimits(request.type.value);
    if (showLimits) {
      result.limits = serializeLimitValues(request.type.value, request.limits);
    }
  }
  return result;
};
