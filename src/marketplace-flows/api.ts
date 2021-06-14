import { post } from '@waldur/core/api';

export const createFlow = (payload) =>
  post(`/marketplace-resource-creation-flows/`, payload);

export const submitFlow = (id: string) =>
  post(`/marketplace-resource-creation-flows/${id}/submit/`);

export const cancelFlow = (id: string) =>
  post(`/marketplace-resource-creation-flows/${id}/cancel/`);

export const approveCustomer = (id: string, comment?: string) =>
  post(`/marketplace-customer-creation-requests/${id}/approve/`, { comment });

export const rejectCustomer = (id: string, comment?: string) =>
  post(`/marketplace-customer-creation-requests/${id}/reject/`, { comment });

export const approveProject = (id: string, comment?: string) =>
  post(`/marketplace-project-creation-requests/${id}/approve/`, { comment });

export const rejectProject = (id: string, comment?: string) =>
  post(`/marketplace-project-creation-requests/${id}/reject/`, { comment });

export const approveResource = (id: string, comment?: string) =>
  post(`/marketplace-resource-creation-requests/${id}/approve/`, { comment });

export const rejectResource = (id: string, comment?: string) =>
  post(`/marketplace-resource-creation-requests/${id}/reject/`, { comment });
