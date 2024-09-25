import { ENV } from '@waldur/configs/default';
import { deleteById, getList, post, sendForm } from '@waldur/core/api';
import {
  OfferingCostPolicyFormData,
  OfferingUsagePolicyFormData,
} from '@waldur/marketplace/offerings/details/policies/types';

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

export const createOfferingCostPolicy = (
  formData: OfferingCostPolicyFormData,
) => post('/marketplace-offering-estimated-cost-policies/', formData);

export const deleteOfferingCostPolicy = (uuid: string) =>
  deleteById('/marketplace-offering-estimated-cost-policies/', uuid);

export const createOfferingUsagePolicy = (
  formData: OfferingUsagePolicyFormData,
) => post('/marketplace-offering-usage-policies/', formData);

export const deleteOfferingUsagePolicy = (uuid: string) =>
  deleteById('/marketplace-offering-usage-policies/', uuid);
