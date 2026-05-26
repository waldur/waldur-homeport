import { CallReviewerPool } from 'waldur-js-client';

// Extended type to include COI and review stats from backend
export type CallReviewerPoolExtended = CallReviewerPool & {
  coi_count?: number;
  coi_by_severity?: Record<string, number>;
  reviews_in_progress?: number;
  reviews_completed?: number;
  override_reason?: string;
  overridden_by_name?: string;
  invitation_link?: string | null;
};
