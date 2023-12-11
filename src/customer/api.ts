import { post, deleteById, getFirst, getList, put } from '@waldur/core/api';

import { CallManagingOrganizationInfo, ProposalProtectedCall } from './types';

export const organizationCallManagingInfo = (customerUuid) =>
  getFirst<CallManagingOrganizationInfo>('/call-managing-organisations/', {
    customer_uuid: customerUuid,
  }).then((data) => (data ? data : null));

export const getCallManagingOrganization = (customerUuid) =>
  getFirst<CallManagingOrganizationInfo>('/call-managing-organisations/', {
    customer_uuid: customerUuid,
  });

export const getCallManagingOrganizations = () =>
  getList<CallManagingOrganizationInfo>('/call-managing-organisations/');

export const enableCallManagingOrganization = (payload) =>
  post<CallManagingOrganizationInfo>(
    '/call-managing-organisations/',
    payload,
  ).then((response) => response.data);

export const disableCallManagingOrganization = (uuid) =>
  deleteById('/call-managing-organisations/', uuid);

export const removeCall = (uuid: string) =>
  deleteById('/marketplace-categories/', uuid);

export const createCall = (data) => {
  return post<ProposalProtectedCall>('/proposal-protected-calls/', data);
};

export const updateCall = (data, uuid) => {
  return put<ProposalProtectedCall>(`/proposal-protected-calls/${uuid}/`, data);
};
