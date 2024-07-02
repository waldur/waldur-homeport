import { ENV } from '@waldur/configs/default';
import { deleteById, getFirst, sendForm } from '@waldur/core/api';
import { Customer } from '@waldur/workspace/types';

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

export const updateCustomer = (
  customerUuid: string,
  values: Record<string, any>,
) => {
  const data = { ...values };
  if ('image' in data && !data.image) {
    data.image = '';
  }
  if ('country' in data && data.country) {
    data.country = data.country.value;
  }

  return sendForm<Customer>(
    'PATCH',
    `${ENV.apiEndpoint}api/customers/${customerUuid}/`,
    data,
  );
};
