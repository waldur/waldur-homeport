import { ENV } from '@waldur/configs/default';
import { deleteById, getList, sendForm } from '@waldur/core/api';

import { CostPolicy, CostPolicyFormData } from './types';

export const getCostPolicies = (params?: {}) =>
  getList<CostPolicy>('/marketplace-project-estimated-cost-policies/', params);

export const createCostPolicy = (formData: CostPolicyFormData) => {
  return sendForm(
    'POST',
    `${ENV.apiEndpoint}api/marketplace-project-estimated-cost-policies/`,
    formData,
  );
};

export const deleteCostPolicy = (uuid: string) =>
  deleteById('/marketplace-project-estimated-cost-policies/', uuid);
