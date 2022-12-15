import { getList, post } from '@waldur/core/api';

export const getProjectUpdateRequestsList = (params?: {}) =>
  getList('/marketplace-project-update-requests/', params);

export const approveProjectUpdateRequest = (id: string, comment?: string) =>
  post(`/marketplace-project-update-requests/${id}/approve/`, { comment });

export const rejectProjectUpdateRequest = (id: string, comment?: string) =>
  post(`/marketplace-project-update-requests/${id}/reject/`, { comment });
