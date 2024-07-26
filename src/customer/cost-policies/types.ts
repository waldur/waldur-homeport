export interface CostPolicyFormData {
  limit_cost: number;
  scope: string;
  actions: string;
}

export interface CostPolicy extends CostPolicyFormData {
  uuid: string;
  url: string;
  scope_name: string;
  scope_uuid: string;
  created: string;
  created_by_full_name: string;
  created_by_username: string;
  has_fired: boolean;
  billing_price_estimate: object;
}

export type CostPolicyType = 'project' | 'organization';
