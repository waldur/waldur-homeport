import { AxiosRequestConfig } from 'axios';

import { getById, post, deleteById, getFirst, put } from '@waldur/core/api';

import {
  CallManagingOrganizationInfo,
  ProposalCall,
  ProposalCallRound,
} from './types';

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

export const getProtectedCall = (id: string, options?: AxiosRequestConfig) =>
  getById<ProposalCall>('/proposal-protected-calls/', id, options);

export const createCall = (data) => {
  return post<ProposalCall>('/proposal-protected-calls/', data);
};

export const updateCall = (data, uuid) => {
  return put<ProposalCall>(`/proposal-protected-calls/${uuid}/`, data);
};

export const getPublicCall = (uuid: string, options?: AxiosRequestConfig) =>
  getById<ProposalCall>('/proposal-public-calls/', uuid, options);

export const createCallRound = (callUuid, data) => {
  return post<ProposalCallRound>(
    `/proposal-protected-calls/${callUuid}/rounds/`,
    data,
  );
};
