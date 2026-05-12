import { PolicyPeriodEnum } from 'waldur-js-client';

export interface OfferingCostPolicyFormData {
  scope: string;
  actions: string;
  organization_groups: string[];
  limit_cost: number;
  project_credit?: number;
  period: PolicyPeriodEnum;
}

export interface OfferingUsagePolicyFormData {
  scope: string;
  actions: string;
  organization_groups: string[];
  component_limits_set: Array<{ type: string; limit: number }>;
  period: PolicyPeriodEnum;
}

export type OfferingPolicyType = 'cost' | 'usage';
