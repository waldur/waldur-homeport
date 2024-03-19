import { Limits } from '@waldur/marketplace/details/types';
import { AttributesType, Offering, Plan } from '@waldur/marketplace/types';

export type RoundReviewStrategy = 'after_round' | 'after_proposal';

export type RoundAllocationStrategy = 'by_call_manager' | 'automatic';

export type RoundAllocationTime = 'on_decision' | 'fixed_date';

export type CallState = 'active' | 'draft' | 'archived';

export type ProposalState =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'in_revision'
  | 'accepted'
  | 'rejected'
  | 'canceled';

export type CallOfferingState = 'requested' | 'accepted' | 'canceled';

export type ReviewState = 'created' | 'in_review' | 'submitted' | 'rejected';

export interface CallManagingOrganization {
  uuid: string;
  url: string;
  customer_name: string;
  customer_uuid: string;
  description?: string;
  image?: string;
}

export interface Round {
  uuid: string;
  start_time: string;
  cutoff_time: string;
  review_strategy: RoundReviewStrategy;
  deciding_entity: RoundAllocationStrategy;
  allocation_time: RoundAllocationTime;
  max_allocations: number;
  allocation_date: string;
  minimal_average_scoring: string;
  review_duration_in_days: number;
  minimum_number_of_reviewers: number;
  url: string;
}

export interface Call {
  url: string;
  uuid: string;
  created: string;
  name: string;
  description: string;
  reference_code: string;
  start_time: string;
  end_time: string;
  state: CallState;
  manager: string;
  customer_name: string;
  created_by: string;

  backend_id?: string;
  offerings: Offering[];
  rounds: Round[];
}

export interface RoundFormData {
  start_time: string;
  timezone: string;
  cutoff_time: string;
  review_strategy: RoundReviewStrategy;
  review_duration_in_days: number;
  minimum_number_of_reviewers: number;
  deciding_entity: RoundAllocationStrategy;
  max_allocations: number;
  minimal_average_scoring: string;
  allocation_time: RoundAllocationTime;
  allocation_date: string;
}

export interface EditCallProps {
  call: Call;
  fields: string[];
  refetch(): void;
}

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
  round: Round;
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
  state: CallOfferingState;
  plan?: string;
  plan_name?: string;
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

export interface ProposalReview {
  url: string;
  uuid: string;
  proposal: string;
  reviewer: string;
  state: ReviewState;
  summary_score: number;
  summary_public_comment: string;
  summary_private_comment: string;
  proposal_name: string;
  review_end_date: string;
  round_uuid: string;
  call_name: string;
  call_uuid: string;
}
