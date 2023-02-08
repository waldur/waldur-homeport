import Axios from 'axios';

import { ENV } from '@waldur/configs/default';
import { getList, parseResultCount, post } from '@waldur/core/api';

export const getProjectUpdateRequestsList = (params?: {}) =>
  getList('/marketplace-project-update-requests/', params);

export const countProjectUpdateRequestsList = (params) =>
  Axios.request({
    method: 'HEAD',
    url: ENV.apiEndpoint + 'api/marketplace-project-update-requests/',
    params,
  }).then(parseResultCount);

export const approveProjectUpdateRequest = (id: string, comment?: string) =>
  post(`/marketplace-project-update-requests/${id}/approve/`, { comment });

export const rejectProjectUpdateRequest = (id: string, comment?: string) =>
  post(`/marketplace-project-update-requests/${id}/reject/`, { comment });
