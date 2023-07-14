export interface CostPolicyFormData {
  limit_cost: number;
  project: string;
  actions: string;
}

export interface CostPolicy extends CostPolicyFormData {
  uuid: string;
  url: string;
  project_name: string;
  created: string;
  created_by_full_name: string;
  created_by_username: string;
}
