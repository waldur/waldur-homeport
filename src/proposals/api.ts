import Axios, { AxiosRequestConfig } from 'axios';

import { ENV } from '@waldur/configs/default';
import {
  deleteById,
  fixURL,
  get,
  getAll,
  getById,
  getFirst,
  getSelectData,
  patch,
  post,
  put,
  sendForm,
} from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { GenericPermission } from '@waldur/permissions/types';

import {
  Call,
  CallManagementStatistics,
  CallManagingOrganization,
  CallOffering,
  Proposal,
  Round,
  ProposalReview,
} from './types';

export const getCallManagingOrganization = (customerUuid) =>
  getFirst<CallManagingOrganization>('/call-managing-organisations/', {
    customer_uuid: customerUuid,
  }).then((data) => (data ? data : null));

export const enableCallManagingOrganization = (payload) =>
  post<CallManagingOrganization>('/call-managing-organisations/', payload).then(
    (response) => response.data,
  );

export const disableCallManagingOrganization = (uuid) =>
  deleteById('/call-managing-organisations/', uuid);

export const getProtectedCall = (uuid: string, options?: AxiosRequestConfig) =>
  getById<Call>('/proposal-protected-calls/', uuid, options);

export const getProtectedCallRound = (
  callUuid: string,
  roundUuid: string,
  options?: AxiosRequestConfig,
) =>
  getById<Round>(
    `/proposal-protected-calls/${callUuid}/rounds/`,
    roundUuid,
    options,
  );

export const createCall = (data) =>
  post<Call>('/proposal-protected-calls/', data);

export const updateCall = (data, uuid) =>
  patch<Call>(`/proposal-protected-calls/${uuid}/`, data);

export const updateCallState = (state: 'activate' | 'archive', uuid) =>
  post<Call>(`/proposal-protected-calls/${uuid}/${state}/`);

export const getPublicCall = (uuid: string, options?: AxiosRequestConfig) =>
  getById<Call>('/proposal-public-calls/', uuid, options);

export const createCallRound = (callUuid, data) => {
  return post<Round>(`/proposal-protected-calls/${callUuid}/rounds/`, data);
};

export const updateCallRound = (callUuid, roundUuid, data) =>
  put<Round>(
    `/proposal-protected-calls/${callUuid}/rounds/${roundUuid}/`,
    data,
  );

export const createCallOffering = (callUuid, data) =>
  post<CallOffering>(`/proposal-protected-calls/${callUuid}/offerings/`, data);

export const acceptCallOfferingRequest = (uuid) =>
  post(`/proposal-requested-offerings/${uuid}/accept/`);

export const rejectCallOfferingRequest = (uuid) =>
  post(`/proposal-requested-offerings/${uuid}/cancel/`);

const getProtectedCallsOptions = (params?: {}) =>
  getSelectData<Call>('/proposal-protected-calls/', params);

const getPublicCallsOptions = (params?: {}) =>
  getSelectData<Call>('/proposal-public-calls/', params);

export const callAutocomplete = async (
  query: any,
  prevOptions,
  currentPage: number,
  protectedCalls = false,
  field = ['name', 'uuid', 'url'],
) => {
  const params = {
    field,
    o: 'name',
    ...query,
    page: currentPage,
    page_size: ENV.pageSize,
  };
  const api = protectedCalls ? getProtectedCallsOptions : getPublicCallsOptions;
  const response = await api(params);
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};

export const getAllCallUsers = (callUuid, role = null) =>
  getAll<GenericPermission>(
    `/proposal-protected-calls/${callUuid}/list_users/`,
    role ? { params: { role } } : null,
  );

export const createProposal = (data) =>
  post<Proposal>(`/proposal-proposals/`, data);

export const getProposal = (uuid) =>
  getById<Proposal>(`/proposal-proposals/`, uuid);

export const rejectProposal = (uuid) =>
  post<Proposal>(`/proposal-proposals/${uuid}/reject/`);

export const updateProposalProjectDetails = (data, uuid) =>
  post<Proposal>(`/proposal-proposals/${uuid}/update_project_details/`, data);

export const submitProposal = (uuid) =>
  post<Proposal>(`/proposal-proposals/${uuid}/submit/`);

export const switchProposalToTeamVerification = (uuid) =>
  post<Proposal>(`/proposal-proposals/${uuid}/switch_to_team_verification/`);

export const createProposalResource = (data, proposalUuid) =>
  post<Proposal>(`/proposal-proposals/${proposalUuid}/resources/`, data);

export const updateProposalResource = (data, proposalUuid, uuid) =>
  patch<Proposal>(
    `/proposal-proposals/${proposalUuid}/resources/${uuid}/`,
    data,
  );

export const removeProposalResource = (proposalUuid, uuid) =>
  deleteById(`/proposal-proposals/${proposalUuid}/resources/`, uuid);

export const getProposalReview = (reviewUuid) =>
  getById<ProposalReview>('/proposal-reviews/', reviewUuid);

export const getAllProposalReviews = (proposalUuid) =>
  getAll<ProposalReview>('/proposal-reviews/', {
    params: { proposal_uuid: proposalUuid },
  });

export const createProposalReview = (data) =>
  post<ProposalReview>(`/proposal-reviews/`, data);

export const updateProposalReview = (data, uuid) =>
  patch<ProposalReview>(`/proposal-reviews/${uuid}/`, data);

export const submitProposalReview = (data, uuid) =>
  post<ProposalReview>(`/proposal-reviews/${uuid}/submit/`, data);

export const acceptProposalReview = (uuid) =>
  post(`/proposal-reviews/${uuid}/accept/`);

export const rejectProposalReview = (uuid) =>
  post(`/proposal-reviews/${uuid}/reject/`);

export const getCallManagementStatistics = (uuid) => {
  return get<CallManagementStatistics>(
    `/call-managing-organisations/${uuid}/stats/`,
  ).then((response) => response.data);
};

export const attachDocument = (proposal_uuid, file) =>
  sendForm(
    'POST',
    fixURL(`/proposal-proposals/${proposal_uuid}/attach_document/`),
    { file },
  );

export const deleteRequestedOffering = (requestedOfferingURL: string) =>
  Axios.delete(requestedOfferingURL);
