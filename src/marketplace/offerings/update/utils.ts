import { getOfferingTypes } from '@waldur/marketplace/common/registry';
import { Offering, Category, OfferingOptions } from '@waldur/marketplace/types';

import { getAccountingTypeOptions } from '../create/ComponentAccountingTypeField';
import { getLimitPeriods } from '../create/ComponentLimitPeriodField';
import { FIELD_TYPES } from '../option/constants';
import { parseOfferingLimits } from '../store/limits';
import { getOffering, getCategories } from '../store/selectors';

const parseOptions = (options: OfferingOptions) =>
  options && options.order
    ? options.order
        .filter(name => options.options[name] !== undefined)
        .map((name: string) => {
          const option = options.options[name];
          return {
            ...option,
            name,
            type: FIELD_TYPES.find(
              fieldType => fieldType.value === option.type,
            ),
            choices: Array.isArray(option.choices)
              ? option.choices.join(', ')
              : option.choices,
          };
        })
    : [];

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
    if (!meta) {
      return acc;
    }
    if (Array.isArray(meta.options)) {
      if (meta.type === 'choice') {
        attr = meta.options.find(opt => opt.key === attr);
      } else if (meta.type === 'list' && Array.isArray(attr)) {
        attr = attr
          .map(choice => meta.options.find(opt => opt.key === choice))
          .filter(x => x !== undefined);
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
    billing_type: options.find(
      option => option.value === component.billing_type,
    ),
    limit_period: limitPeriods.find(
      option => option.value === component.limit_period,
    ),
  }));
};

export const getInitialValues = state => {
  const offering: Offering = getOffering(state).offering;
  if (!offering) {
    return {};
  }
  const categories = getCategories(state);
  const offeringTypes = getOfferingTypes();
  const category = categories.find(
    option => option.uuid === offering.category_uuid,
  );
  const options = parseOptions(offering.options);
  let schedules;
  if (offering.attributes && offering.attributes.schedules) {
    schedules = offering.attributes.schedules;
  }

  const attributes = category
    ? parseAttributes(category, offering.attributes)
    : undefined;
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
    schedules,
    options,
    plugin_options: offering.plugin_options,
    secret_options: offering.secret_options,
    plans: offering.plans,
    components: offering.components ? parseComponents(offering.components) : [],
    limits: offering.components ? parseOfferingLimits(offering) : {},
  };
};
