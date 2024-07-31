import { formValueSelector, isDirty } from 'redux-form';

import {
  getFormLimitSerializer,
  getFormSerializer,
} from '@waldur/marketplace/common/registry';

import { ORDER_FORM_ID } from './constants';
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
    limits = {
      ...Object.keys(planQuotas).reduce(
        (acc, key) =>
          limitedComponents.includes(key)
            ? { ...acc, [key]: planQuotas[key] }
            : acc,
        {},
      ),
    };
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
  project: props.formData?.project?.url,
  plan: props.formData?.plan?.url,
  attributes: formatAttributes(props),
  limits: formatLimits(props),
});

export const orderFormValues = formValueSelector(ORDER_FORM_ID);

export const orderFormIsDirty = isDirty(ORDER_FORM_ID);

export const orderCustomerSelector = (state) =>
  orderFormValues(state, 'customer');

export const orderProjectSelector = (state) =>
  orderFormValues(state, 'project');
