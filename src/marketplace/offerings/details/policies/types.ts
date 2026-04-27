import { PolicyPeriod } from '@/customer/cost-policies/types';

export interface OfferingCostPolicyFormData {
  scope: string;
  actions: string;
  organization_groups: string[];
  limit_cost: number;
  project_credit?: number;
  period: PolicyPeriod;
}

export interface OfferingUsagePolicyFormData {
  scope: string;
  actions: string;
  organization_groups: string[];
  component_limits_set: Array<{ type: string; limit: number }>;
  period: PolicyPeriod;
}

export type OfferingPolicyType = 'cost' | 'usage';
