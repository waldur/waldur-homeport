import {
  RequestedOffering,
  ProviderOfferingDetails as Offering,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';

import { Limits } from '@/marketplace/details/types';
import { AttributesType } from '@/marketplace/types';

export {
  type Proposal,
  ProposalReview,
  type ProtectedCall as Call,
} from 'waldur-js-client';

export type AllocationTime = 'on_decision' | 'fixed_date';

export type CallState = 'active' | 'draft' | 'archived';

export type ProposalState =
  'draft' | 'submitted' | 'in_review' | 'accepted' | 'rejected' | 'canceled';

export type CallOfferingState = 'requested' | 'accepted' | 'canceled';

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
  /** Requested component limits (e.g. { cpu_hours: 80000, storage: 500 });
   * a top-level field on the requested resource, not part of attributes. */
  limits?: Record<string, number>;
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
