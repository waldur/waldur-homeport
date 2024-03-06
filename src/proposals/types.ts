import { Limits } from '@waldur/marketplace/details/types';
import { AttributesType, Offering, Plan } from '@waldur/marketplace/types';

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

export interface ProposalCall {
  url: string;
  uuid: string;
  created: string;
  name: string;
  description: string;
  reference_code: string;
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

type ProposalState = 'Active' | 'Draft' | 'Archive';

export interface Proposal {
  uuid: string;
  url: string;
  name: string;
  project_summary: string;
  project_is_confidential: boolean;
  project_has_civilian_purpose: boolean;
  supporting_documentation: any[];
  state: ProposalState;
  approved_by: string;
  created_by: string;
  duration_in_days: number;
  project: string;
  round: ProposalCallRound;
}

export interface CallOffering {
  url: string;
  uuid: string;
  attributes: AttributesType;
  call: string;
  call_name: string;
  created_by_email: string;
  created_by_name: string;
  description: string;
  offering: string;
  offering_name: string;
  provider_name: string;
  state: 'Requested' | 'Accepted' | 'Canceled';
}

export interface CallOfferingFormData {
  offering: Offering;
  attributes: AttributesType;
  description: string;
  plan: Plan;
  limits?: Limits;
}

export interface ProposalCreationFormStep {
  label: string;
  id: string;
  component: React.ComponentType<ProposalFormStepProps>;
}

export interface ProposalFormStepProps {
  step: number;
  id: string;
  title?: string;
  observed?: boolean;
  change?(field: string, value: any): void;
}
