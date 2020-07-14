import { getAll } from '@waldur/core/api';

import { getChartSpec } from './constants';

export const getAllocationUsages = (params) =>
  getAll('/slurm-allocation-usage/', { params });

export const getAllocationUserUsages = (params) =>
  getAll('/slurm-allocation-user-usage/', { params });

export const loadCharts = async (allocationUrl) => {
  const usages = await getAllocationUsages({
    allocation: allocationUrl,
  });
  const userUsages = await getAllocationUserUsages({
    allocation: allocationUrl,
  });
  const charts = getChartSpec();
  return { charts, usages, userUsages };
};
