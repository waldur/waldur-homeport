import { put } from '@waldur/core/api';

export const updateAllocation = (id, data) =>
  put(`/slurm-allocations/${id}/`, data);
