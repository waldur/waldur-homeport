import { RequestedOffering, type ProtectedCall } from 'waldur-js-client';

import { Limits } from '@/marketplace/details/types';
import { AttributesType, Offering, Plan } from '@/marketplace/types';

export {
  type Proposal,
  ProposalReview,
  type ProtectedCall as Call,
} from 'waldur-js-client';

type Call = ProtectedCall;

export type RoundReviewStrategy = 'after_round' | 'after_proposal';

export type RoundAllocationStrategy = 'by_call_manager' | 'automatic';

export type RoundAllocationTime = 'on_decision' | 'fixed_date';

export type CallState = 'active' | 'draft' | 'archived';

export type ProposalState =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'accepted'
  | 'rejected'
  | 'canceled';

export type CallOfferingState = 'requested' | 'accepted' | 'canceled';

export interface EditCallProps {
  call: Call;
  name: string;
  title: string;

  refetch(): void;
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
  offering_uuid: string;
  offering_name: string;
  provider_name: string;
  state: CallOfferingState;
  category_name?: string;
  plan: string;
  plan_details: Plan;
  options?: Offering['options'];
  components?: Offering['components'];
}

export interface CallOfferingFormData {
  offering: Offering;
  attributes: AttributesType;
  description: string;
  plan: Plan;
  limits?: Limits;
}

export interface ProposalResource {
  attributes: AttributesType;
  created_by: string;
  created_by_name: string;
  description: string;
  requested_offering: CallOffering;
  resource: any;
  url: string;
  uuid: string;
}

export interface ProposalResourceFormData {
  offering: RequestedOffering;
  attributes: AttributesType;
  plan: Plan;
  limits?: Limits;
}
