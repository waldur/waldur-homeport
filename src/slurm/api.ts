import { ENV } from '@waldur/configs/default';
import { post, put, sendForm } from '@waldur/core/api';

import { AllocationLimits } from './types';

export const setLimits = (id, data: AllocationLimits) =>
  post(`/slurm-allocations/${id}/set_limits/`, data);

export const updateAllocation = (id, data) =>
  put(`/slurm-allocations/${id}/`, data);

export const pullAllocation = (id: string) =>
  post(`/slurm-allocations/${id}/pull/`);

export const submitJob = (payload) =>
  sendForm('POST', `${ENV.apiEndpoint}api/slurm-jobs/`, payload);
