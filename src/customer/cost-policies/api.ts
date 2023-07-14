import { ENV } from '@waldur/configs/default';
import { deleteById, sendForm } from '@waldur/core/api';

import { CostPolicyFormData } from './types';

export const createCostPolicy = (formData: CostPolicyFormData) => {
  return sendForm(
    'POST',
    `${ENV.apiEndpoint}api/marketplace-project-estimated-cost-policies/`,
    formData,
  );
};

export const deleteCostPolicy = (uuid: string) =>
  deleteById('/marketplace-project-estimated-cost-policies/', uuid);
