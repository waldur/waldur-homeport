import { ENV } from '@waldur/configs/default';
import { deleteById, getFirst, sendForm } from '@waldur/core/api';

export const getPendingReview = (customerId: string) =>
  getFirst('/customer-permissions-reviews/', {
    customer_uuid: customerId,
    is_pending: true,
  });

export const createAccessSubnet = (data) =>
  sendForm('POST', `${ENV.apiEndpoint}api/access-subnets/`, data);

export const removeAccessSubnet = (uuid) =>
  deleteById('/access-subnets/', uuid);

export const updateAccessSubnet = (uuid, data) =>
  sendForm('PATCH', `${ENV.apiEndpoint}api/access-subnets/${uuid}/`, data);
