import { omit, pick } from '@waldur/core/utils';
import { showOfferingLimits } from '@waldur/marketplace/common/registry';
import { OFFERING_TABLE_NAME } from '@waldur/marketplace/offerings/store/constants';
import {
  OptionField,
  Category,
  Attribute,
  OfferingComponent,
} from '@waldur/marketplace/types';
import { fetchListStart } from '@waldur/table/actions';
import { Customer, User } from '@waldur/workspace/types';

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
  validComponents: string[],
): PlanRequest => {
  const result: PlanRequest = {
    name: plan.name,
    unit: plan.unit.value,
    unit_price: plan.unit_price,
    article_code: plan.article_code,
  };
  if (plan.prices) {
    // Skip prices for invalid components
    result.prices = Object.keys(plan.prices).reduce(
      (acc, key) =>
        validComponents.includes(key)
          ? { ...acc, [key]: plan.prices[key] }
          : acc,
      {},
    );
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
  order: options.map((option) => option.name),
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
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
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
        value = value.map((item) => item.key);
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

const getBillingTypeValue = (option) =>
  typeof option === 'object' ? option.value : option;

export const formatComponents = (components) =>
  components.map((component) => ({
    ...component,
    billing_type: getBillingTypeValue(component.billing_type),
    limit_period: component.limit_period ? component.limit_period.value : null,
  }));

export const formatSchedules = (schedules) =>
  schedules.map(
    pick(['start', 'end', 'title', 'allDay', 'extendedProps', 'id']),
  );

const mergeComponents = (
  c1: OfferingComponent[],
  c2: OfferingComponent[],
): OfferingComponent[] => {
  const result = [...c1];
  for (const component of c2) {
    // Skip extra component if it is already is in the result
    if (result.some((c) => c.type == component.type)) {
      continue;
    }
    result.push(component);
  }
  return result;
};

const formatPlans = (
  plans: PlanFormData[],
  allComponents: OfferingComponent[],
): PlanRequest[] => {
  const fixedComponents = allComponents
    .filter((c) => getBillingTypeValue(c.billing_type) === 'fixed')
    .map((c) => c.type);
  const validComponents = allComponents.map((c) => c.type);
  return plans.map((plan) =>
    formatPlan(plan, fixedComponents, validComponents),
  );
};

export const formatOfferingRequest = (
  request: OfferingFormData,
  builtinComponents: OfferingComponent[],
  customer?: Customer,
) => {
  const result: OfferingRequest = {
    name: request.name,
    description: request.description,
    full_description: request.full_description,
    terms_of_service: request.terms_of_service,
    access_url: request.access_url,
    category: request.category.url,
    customer: customer ? customer.url : undefined,
    type: request.type ? request.type.value : undefined,
    service_attributes: request.service_settings || {},
    backend_id: request.backend_id,
    shared: true,
  };
  if (request.attributes) {
    result.attributes = formatAttributes(request.category, request.attributes);
  }
  const customComponents = request.components;
  if (customComponents) {
    // Serialize custom components only if there're no built-in components.
    result.components = formatComponents(customComponents);
  }

  if (request.schedules) {
    result.attributes = {
      ...result.attributes,
      schedules: formatSchedules(request.schedules),
    };
  }

  result.plugin_options = request.plugin_options;
  result.secret_options = request.secret_options;

  if (request.plans) {
    const allComponents = mergeComponents(
      builtinComponents || [],
      customComponents || [],
    );
    result.plans = formatPlans(request.plans, allComponents);
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

export const updatePublicOfferingsList = (
  customer: Customer,
  shouldFilterByServiceManagerUuid: boolean,
  user: User,
  state: { value: string }[],
) =>
  fetchListStart(OFFERING_TABLE_NAME, {
    billable: true,
    shared: true,
    customer_uuid: customer.uuid,
    state: state.map((option) => option.value),
    service_manager_uuid: shouldFilterByServiceManagerUuid
      ? user.uuid
      : undefined,
  });

export const filterPluginsData = (pluginsData) =>
  pluginsData.reduce(
    (result, plugin) => ({ ...result, [plugin.offering_type]: plugin }),
    {},
  );
