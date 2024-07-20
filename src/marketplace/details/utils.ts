import { formValueSelector, isDirty } from 'redux-form';

import { OrderRequest } from '@waldur/marketplace/cart/types';
import {
  getFormLimitSerializer,
  getFormSerializer,
} from '@waldur/marketplace/common/registry';

import { ORDER_FORM_ID } from './constants';
import { OrderSummaryProps } from './types';

export const formatOrderForCreate = (props: OrderSummaryProps) => {
  const request: OrderRequest = { offering: props.offering };
  const serializer = getFormSerializer(props.offering.type);
  const limitSerializer = getFormLimitSerializer(props.offering.type);
  if (props.formData) {
    request.plan = props.formData.plan;
    if (props.formData.attributes) {
      request.attributes = serializer(
        props.formData.attributes,
        props.offering,
      );
    }
    if (props.formData.limits) {
      if (props.formData.plan && props.formData.plan.quotas) {
        const planQuotas = props.formData.plan.quotas;
        const limitedComponents = props.offering.components
          .filter((c) => c.billing_type === 'limit')
          .map((c) => c.type);
        // Filter out disabled plan quotas
        request.limits = {
          ...Object.keys(planQuotas).reduce(
            (acc, key) =>
              limitedComponents.includes(key)
                ? { ...acc, [key]: planQuotas[key] }
                : acc,
            {},
          ),
        };
      }
      request.limits = {
        ...request.limits,
        ...limitSerializer(props.formData.limits),
      };
    }
    request.project = props.formData.project?.url;
  }
  return request;
};

export const orderFormValues = formValueSelector(ORDER_FORM_ID);

export const orderFormIsDirty = isDirty(ORDER_FORM_ID);

export const orderCustomerSelector = (state) =>
  orderFormValues(state, 'customer');

export const orderProjectSelector = (state) =>
  orderFormValues(state, 'project');
