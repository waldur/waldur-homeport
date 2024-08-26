import { pick } from '@waldur/core/utils';
import { OptionField } from '@waldur/marketplace/types';

import { FieldType } from '../update/options/types';

import { PlanRequest, PlanFormData, OptionFormData } from './types';

export const formatPlan = (plan: PlanFormData): PlanRequest => ({
  name: plan.name,
  unit: plan.unit.value,
  unit_price: plan.unit_price,
  article_code: plan.article_code,
  description: plan.description,
  uuid: plan.uuid,
});

export const formatOption = (option: OptionFormData) => {
  const { type, choices, ...rest } = option;
  const item: OptionField = {
    type: type.value as FieldType,
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

export const formatSchedules = (schedules: any[]) =>
  schedules
    .filter((item) => Object.keys(item).length > 0)
    .map(pick(['start', 'end', 'title', 'allDay', 'extendedProps', 'id']));

export const filterPluginsData = (pluginsData) =>
  pluginsData.reduce(
    (result, plugin) => ({ ...result, [plugin.offering_type]: plugin }),
    {},
  );
