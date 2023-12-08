import { post, deleteById, getFirst } from '@waldur/core/api';

import { CallManagingOrganizationInfo } from './types';

export const organizationCallManagingInfo = (customerUuid) =>
  getFirst<CallManagingOrganizationInfo>('/call-managing-organisations/', {
    customer_uuid: customerUuid,
  }).then((data) => (data ? data : null));

export const enableCallManagingOrganization = (payload) =>
  post<CallManagingOrganizationInfo>(
    '/call-managing-organisations/',
    payload,
  ).then((response) => response.data);

export const disableCallManagingOrganization = (uuid) =>
  deleteById('/call-managing-organisations/', uuid);
