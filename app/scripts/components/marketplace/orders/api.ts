import { get } from '@waldur/core/api';
import { State } from '@waldur/marketplace/cart/types';

export const getOrderDetails = (orderUuid: string) => get<State>(`/marketplace-orders/${orderUuid}/`).then(response => response.data);
