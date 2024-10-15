import { deleteById, getFirst, post, put } from '@waldur/core/api';

import {
  CustomerCredit,
  CustomerCreditFormData,
  ProjectCredit,
  ProjectCreditFormData,
} from './types';

export const getCustomerCredit = (customer_uuid: string) => {
  return getFirst<CustomerCredit>('/customer-credits/', { customer_uuid });
};

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

export const createProjectCredit = (formData: ProjectCreditFormData) => {
  return post<CustomerCredit>('/project-credits/', formData);
};

export const updateProjectCredit = (
  uuid: string,
  formData: ProjectCreditFormData,
) => {
  return put<ProjectCredit>(`/project-credits/${uuid}/`, formData);
};

export const deleteProjectCredit = (uuid: string) =>
  deleteById('/project-credits/', uuid);
