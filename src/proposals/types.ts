import { Offering } from '@waldur/marketplace/types';

export interface CallManagingOrganizationInfo {
  uuid: string;
  url: string;
  customer_name: string;
  customer_uuid: string;
  description?: string;
  image?: string;
}

export interface ProposalCallRound {
  uuid: string;
  start_time: string;
  end_time: string;
}

export interface ProposalCall {
  url: string;
  uuid: string;
  created: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  round_strategy: string;
  review_strategy: string;
  allocation_strategy: string;
  state: string;
  manager: string;
  customer_name: string;
  created_by: string;
  offerings: Offering[];
  rounds: ProposalCallRound[];
}

export interface CallRoundFormData {
  start_time: string;
  timezone: string;
  cutoff_time: string;
  review_strategy: string;
  review_duration_in_days: number;
  minimum_number_of_reviewers: number;
  deciding_entity: string;
  max_allocations: number;
  minimal_average_scoring: number;
  allocation_time: string;
  allocation_date: string;
}
