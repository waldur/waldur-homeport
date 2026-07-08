import { Offering, OrderCreateRequest } from 'waldur-js-client';

import {
  getFormLimitSerializer,
  getFormSerializer,
} from '@/marketplace/common/registry';

import { DeployFormData } from '../common/types';

const formatLimits = (offering: Offering, formData: DeployFormData) => {
  let limits = {};
  if (!formData.limits) {
    return limits;
  }
  if (formData.plan && formData.plan.quotas) {
    const planQuotas = formData.plan.quotas;
    const limitedComponents = offering.components
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
  const limitSerializer = getFormLimitSerializer(offering.type);
  limits = {
    ...limits,
    ...limitSerializer(formData.limits),
  };
  return limits;
};

// OpenStack tenant/instance async selects store the whole option object; the
// backend expects the backend_id string. Fall back to `value` for any legacy
// {value,label} shape and pass primitives through unchanged.
const toBackendId = (value) =>
  value && typeof value === 'object'
    ? (value.backend_id ?? value.value)
    : value;

const formatAttributes = (
  offering: Offering,
  formData: DeployFormData,
): OrderCreateRequest['attributes'] => {
  if (!formData.attributes) {
    return {} as any;
  }
  const serializer = getFormSerializer(offering.type);
  const attributes = serializer(formData.attributes, offering);
  const newAttributes = {} as OrderCreateRequest['attributes'];

  for (const [key, value] of Object.entries(attributes)) {
    const optionConfig = offering.options?.options?.[key];

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
    } else if (
      optionConfig?.type === 'select_openstack_tenant' ||
      optionConfig?.type === 'select_openstack_instance'
    ) {
      // The async select stores the whole option object; the backend expects
      // the backend_id string. Sending the object drops the value (backend_id
      // is not under `value`) or fails validation.
      newAttributes[key] = toBackendId(value);
    } else if (
      optionConfig?.type === 'select_multiple_openstack_tenants' ||
      optionConfig?.type === 'select_multiple_openstack_instances'
    ) {
      // Multi async selects store an array of option objects; the backend
      // expects an array of backend_id strings.
      newAttributes[key] = Array.isArray(value)
        ? value.map(toBackendId)
        : value;
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

export const formatOrderForCreate = (
  offering: Offering,
  formData: DeployFormData,
) => ({
  offering: offering.url,
  project: formData?.project?.url || offering.project,
  plan: formData?.plan?.url,
  attributes: formatAttributes(offering, formData),
  limits: formatLimits(offering, formData),
  accepting_terms_of_service: true,
  start_date: formData.start_date,
});
