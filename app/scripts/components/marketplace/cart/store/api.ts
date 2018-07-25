import { post } from '@waldur/core/api';
import { Order } from '@waldur/marketplace/cart/types';

export const createOrder = (order: Order) => post<Order>('/marketplace-orders/', order);
