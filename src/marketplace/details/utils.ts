import { formValueSelector } from 'redux-form';

import { OrderRequest } from '@waldur/marketplace/cart/types';
import {
  getFormSerializer,
  getFormLimitSerializer,
} from '@waldur/marketplace/common/registry';

import { FORM_ID } from './constants';
import { OrderSummaryProps } from './types';

export const formatOrder = (props: OrderSummaryProps, request) => {
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
    const project = props.project || props.formData.project;
    if (project) {
      request.project = project.url;
    }
    if (props.formData.project_create_request) {
      request.project_create_request = props.formData.project_create_request;
    }
    if (props.formData.customer_create_request) {
      request.customer_create_request = props.formData.customer_create_request;
    }
    if (props.formData.customer) {
      request.customer = props.formData.customer;
    }
  }
  return request;
};

export const formatOrderForCreate = (props: OrderSummaryProps) => {
  const request: OrderRequest = { offering: props.offering };
  return formatOrder(props, request);
};

export const formatOrderForUpdate = (props: OrderSummaryProps) => {
  const request = { uuid: props.offering.uuid };
  return formatOrder(props, request);
};

export const formSelector = formValueSelector(FORM_ID);
