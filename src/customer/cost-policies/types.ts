export type PolicyPeriod = 1 | 2 | 3 | 4;

interface BasePolicy {
  uuid: string;
  url: string;
  scope: string;
  scope_name: string;
  scope_uuid: string;
  created: string;
  created_by_full_name: string;
  created_by_username: string;
  actions: string;
  has_fired: boolean;
  fired_datetime: string;
  period: PolicyPeriod;
  period_name: string;
}

export interface CostPolicyFormData {
  limit_cost: number;
  scope: string;
  actions: string;
}

export interface CostPolicy extends BasePolicy, CostPolicyFormData {
  billing_price_estimate: object;
}

export type CostPolicyType = 'project' | 'organization';
