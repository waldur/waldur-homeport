import { post, deleteById, getList } from '@waldur/core/api';
import { CallManagingOrganizationInfo } from '@waldur/workspace/types';

export const organizationCallManagingInfo = (customerUuid) =>
  getList<CallManagingOrganizationInfo>(
    `/call-managing-organisations/?customer_uuid=${customerUuid}`,
  ).then((data) => (data.length > 0 ? data[0] : null));

export const enableCallManagingOrganization = (payload) =>
  post<CallManagingOrganizationInfo>(
    '/call-managing-organisations/',
    payload,
  ).then((response) => response.data);

export const disableCallManagingOrganization = (uuid) =>
  deleteById('/call-managing-organisations/', uuid);
