import { getAll } from '@waldur/core/api';

import { palette, getChartSpec } from './constants';
import { formatCharts } from './utils';

interface SlurmPackage {
  cpu_price: string;
  gpu_price: string;
  ram_price: string;
}

export const getAllocationUsages = (params) =>
  getAll('/slurm-allocation-usage/', { params });

export const loadPackage = async (serviceSettingsUrl) => {
  const packages = await getAll<SlurmPackage>('/slurm-packages/', {
    params: { service_settings: serviceSettingsUrl },
  });
  if (packages.length !== 1) {
    return;
  }
  const result = packages[0];
  return {
    ...result,
    cpu_price: parseFloat(result.cpu_price),
    gpu_price: parseFloat(result.gpu_price),
    ram_price: parseFloat(result.ram_price),
  };
};

export const loadCharts = async (serviceSettingsUrl, allocationUrl) => {
  const pricePackage = await loadPackage(serviceSettingsUrl);
  const rows = await getAllocationUsages({
    allocation: allocationUrl,
  });
  return formatCharts(palette, getChartSpec(), rows, pricePackage);
};
