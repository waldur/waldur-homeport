import { getAll } from '@waldur/core/api';

import { SlurmAssociation, UserUsage } from './types';

export const getAllocationUserUsages = (params) =>
  getAll<UserUsage>('/slurm-allocation-user-usage/', { params });

export const getSlurmAssociations = (allocation_uuid: string) =>
  getAll<SlurmAssociation>('/slurm-associations/', {
    params: { allocation_uuid },
  });
