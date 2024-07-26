import { ENV } from '@waldur/configs/default';
import { getSelectData, post } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { Role } from '@waldur/permissions/types';

export const approvePermissionRequest = (uuid: string, comment: string) =>
  post(`/user-permission-requests/${uuid}/approve/`, { comment });

export const rejectPermissionRequest = (uuid: string, comment: string) =>
  post(`/user-permission-requests/${uuid}/reject/`, { comment });

export const cancelGroupInvitation = (uuid: string) =>
  post(`/user-group-invitations/${uuid}/cancel/`);

const getRoleOptions = (options?: {}) =>
  getSelectData<Role>('/roles/', options);

export const roleAutocomplete = async (
  query: string,
  prevOptions,
  { page },
) => {
  const params = {
    title: query,
    field: ['name', 'uuid'],
    o: 'name',
    page: page,
    page_size: ENV.pageSize,
  };
  const response = await getRoleOptions(params);
  return returnReactSelectAsyncPaginateObject(response, prevOptions, page);
};
