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
