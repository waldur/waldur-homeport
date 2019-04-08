import { getOfferingTypes } from '@waldur/marketplace/common/registry';
import { Offering, Category } from '@waldur/marketplace/types';

import { getAccountingTypeOptions } from '../create/ComponentAccountingTypeField';
import { getLimitPeriods } from '../create/ComponentLimitPeriodField';
import { FIELD_TYPES } from '../option/constants';
import { getOffering, getCategories } from '../store/selectors';

const parseOptions = options =>
  (options && options.order) ? options.order.map((name: string) => {
    const option = options.options[name];
    return {
      ...option,
      name,
      type: FIELD_TYPES.find(fieldType => fieldType.value === option.type),
    };
  }) : [];

const parseAttributes = (category: Category, attributes) => {
  const attributeMap = {};
  for (const section of category.sections) {
    for (const attr of section.attributes) {
      attributeMap[attr.key] = attr;
    }
  }
  return Object.keys(attributes).reduce((acc, key) => {
    let attr = attributes[key];
    const meta = attributeMap[key];
    if (Array.isArray(meta.options)) {
      if (meta.type === 'choice') {
        attr = meta.options.find(opt => opt.key === attr);
      } else if (meta.type === 'list' && Array.isArray(attr)) {
        attr = attr.map(choice => meta.options.find(opt => opt.key === choice));
      }
    }
    return {
      ...acc,
      [key]: attr,
    };
  }, {});
};

const parseComponents = components => {
  const options = getAccountingTypeOptions();
  const limitPeriods = getLimitPeriods();
  return components.map(component => ({
    ...component,
    billing_type: options.find(option => option.value === component.billing_type),
    limit_period: limitPeriods.find(option => option.value === component.limit_period),
  }));
};

export const getInitialValues = state => {
  const offering: Offering = getOffering(state).offering;
  if (!offering) {
    return {};
  }
  const categories = getCategories(state);
  const offeringTypes = getOfferingTypes();
  const category = categories.find(option => option.uuid === offering.category_uuid);
  const options = parseOptions(offering.options);
  const attributes = category ? parseAttributes(category, offering.attributes) : undefined;

  return {
    name: offering.name,
    description: offering.description,
    full_description: offering.full_description,
    native_name: offering.native_name,
    native_description: offering.native_description,
    terms_of_service: offering.terms_of_service,
    thumbnail: offering.thumbnail,
    type: offeringTypes.find(option => option.value === offering.type),
    category,
    attributes,
    options,
    plans: offering.plans,
    components: offering.components ? parseComponents(offering.components) : [],
  };
};
