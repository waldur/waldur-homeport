import { AxiosRequestConfig } from 'axios';

import { post, deleteById, getFirst, put, getById } from '@waldur/core/api';

import { CallManagingOrganizationInfo, ProposalCall } from './types';

export const organizationCallManagingInfo = (customerUuid) =>
  getFirst<CallManagingOrganizationInfo>('/call-managing-organisations/', {
    customer_uuid: customerUuid,
  }).then((data) => (data ? data : null));

export const getCallManagingOrganization = (customerUuid) =>
  getFirst<CallManagingOrganizationInfo>('/call-managing-organisations/', {
    customer_uuid: customerUuid,
  });

export const enableCallManagingOrganization = (payload) =>
  post<CallManagingOrganizationInfo>(
    '/call-managing-organisations/',
    payload,
  ).then((response) => response.data);

export const disableCallManagingOrganization = (uuid) =>
  deleteById('/call-managing-organisations/', uuid);

export const createCall = (data) => {
  return post<ProposalCall>('/proposal-protected-calls/', data);
};

export const updateCall = (data, uuid) => {
  return put<ProposalCall>(`/proposal-protected-calls/${uuid}/`, data);
};

export const getPublicCall = (uuid: string, options?: AxiosRequestConfig) =>
  getById<ProposalCall>('/proposal-public-calls/', uuid, options);
