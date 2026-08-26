import {
  CallProposalFieldConfig,
  RequestedOffering,
  ProviderOfferingDetails as Offering,
  ProviderPlanDetails as Plan,
  ProposalFieldMetadata as SdkProposalFieldMetadata,
  ProposalFieldStateEnum,
} from 'waldur-js-client';

import { Limits } from '@/marketplace/details/types';
import { AttributesType } from '@/marketplace/types';

export {
  type Proposal,
  ProposalReview,
  type ProtectedCall as Call,
} from 'waldur-js-client';

/** How a call treats one Project details field on the submission form.
 * Generated from the backend's single ProposalFieldStates choice set. */
export type ProposalFieldState = ProposalFieldStateEnum;

/** Configurable Project details fields. `name` and `duration_in_days` are not
 * configurable: the first names the proposal and forms part of the awarded
 * project's name, the second states the length of the award.
 *
 * Narrower than the SDK's `field: string`, which OpenAPI cannot express: the
 * label maps in the UI are keyed on exactly these four. */
export type ProposalFieldName =
  | 'project_summary'
  | 'description'
  | 'science_sub_domain'
  | 'supporting_documentation';

/** Consumers a field feeds, as reported by the backend. Labels are translated
 * in the UI rather than sent over the wire; likewise narrower than the SDK's
 * `usage: string[]`. */
export type ProposalFieldUsage =
  | 'applicant_form'
  | 'reviewer_comment'
  | 'reviewer_matching'
  | 'manager_lists'
  | 'ai_assistant'
  | 'export_import';

/** The generated row, with its loose string fields narrowed to the unions the
 * UI switches on. */
export interface ProposalFieldMetadata extends Omit<
  SdkProposalFieldMetadata,
  'field' | 'allowed_states' | 'usage'
> {
  field: ProposalFieldName;
  /** Omits 'required' once the call has proposals — see locked_reason. */
  allowed_states: ProposalFieldState[];
  usage: ProposalFieldUsage[];
}

export type ProposalFieldConfig = CallProposalFieldConfig;

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
  /** Plugin type; drives the per-type component filter a cost estimate needs. */
  offering_type?: string;
  provider_name: string;
  state: CallOfferingState;
  category_name?: string;
  plan: string;
  plan_details: Plan;
  options?: Offering['options'];
  components?: Offering['components'];
  /** Set by the call manager, seeded from the offering's upload requirement. */
  require_purchase_order?: boolean;
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
  /** Purchase order authorising the spend, collected before submission. */
  purchase_order_reference?: string;
  attachment?: string | null;
  /** Resolved server-side from the call entry, so the form need not re-derive it. */
  purchase_order_required?: boolean;
  has_purchase_order?: boolean;
}

export interface ProposalResourceFormData {
  offering: RequestedOffering;
  attributes: AttributesType;
  plan: Plan;
  limits?: Limits;
  purchase_order_reference?: string;
  /** Newly picked document; null means keep whatever is already stored. */
  attachment?: File | null;
}
