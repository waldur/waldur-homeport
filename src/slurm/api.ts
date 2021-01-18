import { post, put } from '@waldur/core/api';

export const updateAllocation = (id, data) =>
  put(`/slurm-allocations/${id}/`, data);

export const pullAllocation = (id: string) =>
  post(`/slurm-allocations/${id}/pull/`);
