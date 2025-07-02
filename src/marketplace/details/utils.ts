import {
  getFormLimitSerializer,
  getFormSerializer,
} from '@waldur/marketplace/common/registry';

import { OrderSummaryProps } from './types';

const formatLimits = (props) => {
  let limits = {};
  if (!props.formData.limits) {
    return limits;
  }
  if (props.formData.plan && props.formData.plan.quotas) {
    const planQuotas = props.formData.plan.quotas;
    const limitedComponents = props.offering.components
      .filter((c) => c.billing_type === 'limit')
      .map((c) => c.type);
    // Filter out disabled plan quotas
    limits = Object.keys(planQuotas).reduce(
      (acc, key) =>
        limitedComponents.includes(key)
          ? { ...acc, [key]: planQuotas[key] }
          : acc,
      {},
    );
  }
  const limitSerializer = getFormLimitSerializer(props.offering.type);
  limits = {
    ...limits,
    ...limitSerializer(props.formData.limits),
  };
  return limits;
};

const formatAttributes = (props) => {
  if (!props.formData.attributes) {
    return {};
  }
  const serializer = getFormSerializer(props.offering.type);
  const attributes = serializer(props.formData.attributes, props.offering);
  let newAttributes = {};
  for (const [key, value] of Object.entries(attributes)) {
    newAttributes = {
      ...newAttributes,
      [key]:
        typeof value === 'object' && !Array.isArray(value)
          ? value['value']
          : value,
    };
  }
  return newAttributes;
};

export const formatOrderForCreate = (props: OrderSummaryProps) => ({
  offering: props.offering.url,
  project: props.formData?.project?.url || props.offering.project,
  plan: props.formData?.plan?.url,
  attributes: formatAttributes(props),
  limits: formatLimits(props),
  accepting_terms_of_service: true,
});
