import { Customer, PolicyPeriodEnum, Project } from 'waldur-js-client';

export interface CostPolicyFormData {
  limit_cost: number;
  project_credit?: number;
  scope: Array<
    Pick<Project | Customer, 'name' | 'url' | 'billing_price_estimate'>
  >;
  actions: { value; label };
  period: PolicyPeriodEnum;
  options?: {
    notify_external_user?: string;
  };
}

export type CostPolicyType = 'project' | 'organization';
