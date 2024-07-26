import { ENV } from '@waldur/configs/default';
import { deleteById, getList, sendForm } from '@waldur/core/api';

import { CostPolicy, CostPolicyFormData } from './types';

export const getProjectCostPolicies = (params?: {}) =>
  getList<CostPolicy>('/marketplace-project-estimated-cost-policies/', params);

export const createProjectCostPolicy = (formData: CostPolicyFormData) => {
  return sendForm(
    'POST',
    `${ENV.apiEndpoint}api/marketplace-project-estimated-cost-policies/`,
    formData,
  );
};

export const deleteProjectCostPolicy = (uuid: string) =>
  deleteById('/marketplace-project-estimated-cost-policies/', uuid);

export const createOrganizationCostPolicy = (formData: CostPolicyFormData) => {
  return sendForm(
    'POST',
    `${ENV.apiEndpoint}api/marketplace-customer-estimated-cost-policies/`,
    formData,
  );
};

export const deleteOrganizationCostPolicy = (uuid: string) =>
  deleteById('/marketplace-customer-estimated-cost-policies/', uuid);
