import { post, put } from '@waldur/core/api';

import { AllocationLimits } from './types';

export const setLimits = (id, data: AllocationLimits) =>
  post(`/slurm-allocations/${id}/set_limits/`, data);

export const updateAllocation = (id, data) =>
  put(`/slurm-allocations/${id}/`, data);

export const pullAllocation = (id: string) =>
  post(`/slurm-allocations/${id}/pull/`);
