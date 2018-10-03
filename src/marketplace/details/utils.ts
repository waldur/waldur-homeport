import { OrderItemRequest } from '@waldur/marketplace/cart/types';
import { getFormSerializer } from '@waldur/marketplace/common/registry';

import { OrderSummaryProps } from './types';

export const getOrderItem = (props: OrderSummaryProps) => {
  const serializer = getFormSerializer(props.offering.type);
  const request: OrderItemRequest = {offering: props.offering};
  if (props.formData) {
    request.plan = props.formData.plan;
    request.attributes = serializer(props.formData.attributes, props.offering);
    if (props.formData.limits) {
      request.limits = props.formData.limits;
    }
  }
  return request;
};
