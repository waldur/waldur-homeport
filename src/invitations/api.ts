import { post } from '@waldur/core/api';

export const approvePermissionRequest = (uuid: string, comment: string) =>
  post(`/user-permission-requests/${uuid}/approve/`, { comment });

export const rejectPermissionRequest = (uuid: string, comment: string) =>
  post(`/user-permission-requests/${uuid}/reject/`, { comment });

export const cancelGroupInvitation = (uuid: string) =>
  post(`/user-group-invitations/${uuid}/cancel/`);
