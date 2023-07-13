import { getAccountingTypeOptions } from './components/ComponentAccountingTypeField';
import { getLimitPeriods } from './components/ComponentLimitPeriodField';

export const parseAttribute = (attribute, value) => {
  if (Array.isArray(attribute.options)) {
    if (attribute.type === 'choice') {
      return attribute.options.find((opt) => opt.key === value);
    } else if (attribute.type === 'list' && Array.isArray(value)) {
      return value
        .map((choice) => attribute.options.find((opt) => opt.key === choice))
        .filter((x) => x !== undefined);
    }
  }
  return value;
};

export const parseComponent = (component) => {
  const options = getAccountingTypeOptions();
  const limitPeriods = getLimitPeriods();
  return {
    ...component,
    billing_type: options.find(
      (option) => option.value === component.billing_type,
    ),
    limit_period: limitPeriods.find(
      (option) => option.value === component.limit_period,
    ),
  };
};
