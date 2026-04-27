import { OrderCreateRequest } from 'waldur-js-client';

import {
  getFormLimitSerializer,
  getFormSerializer,
} from '@/marketplace/common/registry';

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

const formatAttributes = (props): OrderCreateRequest['attributes'] => {
  if (!props.formData.attributes) {
    return {} as any;
  }
  const serializer = getFormSerializer(props.offering.type);
  const attributes = serializer(props.formData.attributes, props.offering);
  const newAttributes = {} as OrderCreateRequest['attributes'];

  for (const [key, value] of Object.entries(attributes)) {
    const optionConfig = props.offering.options?.options?.[key];

    if (optionConfig?.type === 'conditional_cascade') {
      // For conditional cascade fields, keep the whole object
      newAttributes[key] = value;
    } else if (optionConfig?.type === 'component_multiplier') {
      // For component multiplier fields, store the original user input
      // The multiplication will be handled by backend during order processing
      newAttributes[key] = value;
    } else if (optionConfig?.type === 'storage_folder_manager') {
      // For storage folder manager, keep the whole object structure
      newAttributes[key] = value;
    } else if (
      optionConfig?.type === 'single_datacenter_k8s_config' ||
      optionConfig?.type === 'multi_datacenter_k8s_config'
    ) {
      // For K8s config, parse JSON string if needed
      newAttributes[key] =
        typeof value === 'string' ? JSON.parse(value) : value;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      if (optionConfig) {
        // For offering option select fields, extract the value property
        newAttributes[key] = value['value'];
      } else {
        // For serializer output (e.g. server_group: { url: "..." }), pass through as-is
        newAttributes[key] = value;
      }
    } else {
      // For primitive values, use as-is
      newAttributes[key] = value;
    }
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
  start_date: props.formData.start_date,
});
