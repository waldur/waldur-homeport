import { Offering } from '@waldur/marketplace/types';

export interface CallManagingOrganizationInfo {
  uuid: string;
  url: string;
  customer_name: string;
  customer_uuid: string;
  description?: string;
  image?: string;
}

type CallReviewStrategy = 'After round is closed' | 'After proposal submission';
type CallAllocationStrategy =
  | 'By call manager'
  | 'Automatic based on review scoring';
type CallAllocationTime = 'On decision' | 'Fixed date';

export interface ProposalCallRound {
  uuid: string;
  start_time: string;
  cutoff_time: string;
  review_strategy: CallReviewStrategy;
  deciding_entity: CallAllocationStrategy;
  allocation_time: CallAllocationTime;
  max_allocations: number;
  allocation_date: string;
  minimal_average_scoring: string;
  review_duration_in_days: number;
  minimum_number_of_reviewers: number;
  url: string;
}

export interface ProposalCallReviewer {
  url: string;
  uuid: string;
  user: string;
  user_full_name: string;
  user_native_name: string;
  user_username: string;
  user_uuid: string;
  user_email: string;
  created: string;
  created_by: string;
  created_by_full_name: string;
  created_by_native_name: string;
  created_by_username: string;
  created_by_uuid: string;
  created_by_email: string;
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
  state: 'Active' | 'Draft' | 'Archived';
  manager: string;
  customer_name: string;
  created_by: string;
  offerings: Offering[];
  rounds: ProposalCallRound[];
  reviewers: ProposalCallReviewer[];
}

export interface CallRoundFormData {
  start_time: string;
  timezone: string;
  cutoff_time: string;
  review_strategy: number; // enum
  review_duration_in_days: number;
  minimum_number_of_reviewers: number;
  deciding_entity: number; // enum
  max_allocations: number;
  minimal_average_scoring: string;
  allocation_time: number; // enum
  allocation_date: string;
}

export interface EditCallProps {
  call: ProposalCall;
  fields: string[];
  refetch(): void;
}
