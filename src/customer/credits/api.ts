import { deleteById, post, put } from '@waldur/core/api';

import { CustomerCredit, CustomerCreditFormData } from './types';

export const createCustomerCredit = (formData: CustomerCreditFormData) => {
  return post<CustomerCredit>('/customer-credits/', formData);
};

export const updateCustomerCredit = (
  uuid: string,
  formData: CustomerCreditFormData,
) => {
  return put<CustomerCredit>(`/customer-credits/${uuid}/`, formData);
};

export const deleteCustomerCredit = (uuid: string) =>
  deleteById('/customer-credits/', uuid);
