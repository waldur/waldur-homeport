import { Customer, Project } from 'waldur-js-client';

export type PolicyPeriod = 1 | 2 | 3 | 4;

export interface CostPolicyFormData {
  limit_cost: number;
  project_credit?: number;
  scope: Array<Project | Customer>;
  actions: { value; label };
  period: PolicyPeriod;
  options?: {
    notify_external_user?: string;
  };
}

export type CostPolicyType = 'project' | 'organization';
