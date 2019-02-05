import { OrderItemRequest } from '@waldur/marketplace/cart/types';
import { getFormSerializer } from '@waldur/marketplace/common/registry';

import { OrderSummaryProps } from './types';

export const formatOrderItem = (props: OrderSummaryProps, request) => {
  const serializer = getFormSerializer(props.offering.type);
  if (props.formData) {
    request.plan = props.formData.plan;
    request.attributes = serializer(props.formData.attributes, props.offering);
    if (props.formData.limits) {
      request.limits = props.formData.limits;
    }
  }
  return request;
};

export const formatOrderItemForCreate = (props: OrderSummaryProps) => {
  const request: OrderItemRequest = {offering: props.offering};
  return formatOrderItem(props, request);
};

export const formatOrderItemForUpdate = (props: OrderSummaryProps) => {
  const request = {uuid: props.offering.uuid};
  return formatOrderItem(props, request);
};
