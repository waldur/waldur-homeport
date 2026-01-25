/**
 * Types for Proposal Reporting Module
 * Based on Waldur Call Management domain model
 */

/**
 * Call states as per Waldur proposal system
 */
export type CallState = 'draft' | 'active' | 'archived';

/**
 * Aggregated call performance data for reporting
 */
export interface CallPerformanceData {
  call_uuid: string;
  call_name: string;
  managing_organization_name: string;
  state: CallState;
  /** Total proposals submitted to this call */
  total_proposals: number;
  /** Proposals currently in draft state */
  proposals_draft: number;
  /** Proposals submitted and awaiting review */
  proposals_submitted: number;
  /** Proposals currently being reviewed */
  proposals_in_review: number;
  /** Proposals that were accepted */
  proposals_accepted: number;
  /** Proposals that were rejected */
  proposals_rejected: number;
  /** Proposals that were canceled */
  proposals_canceled: number;
  /** Acceptance rate (accepted / total excluding draft and canceled) */
  acceptance_rate: number;
  /** Total reviews assigned */
  total_reviews: number;
  /** Reviews that have been completed (submitted) */
  reviews_completed: number;
  /** Average review score for submitted reviews */
  average_score: number | null;
  /** Number of active rounds */
  active_rounds: number;
  /** Date of last submission */
  last_submission_date: string | null;
}

/**
 * Review progress data for tracking reviewer workload
 */
export interface ReviewProgressData {
  reviewer_uuid: string;
  reviewer_name: string;
  reviewer_email: string;
  /** Total reviews assigned to this reviewer */
  total_assigned: number;
  /** Reviews that are pending (created state) */
  pending: number;
  /** Reviews currently in progress */
  in_progress: number;
  /** Reviews that have been submitted */
  completed: number;
  /** Reviews that were rejected/declined by reviewer */
  declined: number;
  /** Average score given by this reviewer */
  average_score: number | null;
  /** Average time to complete reviews (in days) */
  average_review_time_days: number | null;
  /** Completion rate percentage */
  completion_rate: number;
}

/**
 * Resource demand data showing what resources are being requested
 */
export interface ResourceDemandData {
  offering_uuid: string;
  offering_name: string;
  offering_type: string;
  provider_name: string;
  /** Number of proposals requesting this offering */
  proposal_count: number;
  /** Total requests for this offering (may be multiple per proposal) */
  request_count: number;
  /** Requests that were approved (proposal accepted) */
  approved_count: number;
  /** Requests pending decision */
  pending_count: number;
  /** Sum of requested limits (varies by offering type) */
  total_requested_limits: Record<string, number>;
  /** Sum of approved limits */
  total_approved_limits: Record<string, number>;
}
