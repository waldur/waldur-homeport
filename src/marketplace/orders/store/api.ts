import { post } from '@waldur/core/api';

export const setOrderState = (orderUuid, state) =>
  post(`/marketplace-orders/${orderUuid}/set_state_${state}/`).then(response => response.data);
