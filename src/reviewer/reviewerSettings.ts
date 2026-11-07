import { ENV } from '@/core/config';

/** The operator's reviewer settings; each defaults to today's behaviour when
 * the backend does not send it. */
const core = () => ENV.plugins?.WALDUR_CORE;

export const reviewerProfilesEnabled = () =>
  core()?.REVIEWER_PROFILES_ENABLED !== false;

export const publicationRequiresApproval = () =>
  core()?.REVIEWER_PUBLICATION_REQUIRES_APPROVAL === true;

export const automatedMatchingEnabled = () =>
  core()?.AUTOMATED_MATCHING_ENABLED !== false;

export const coiDetectionEnabled = () =>
  core()?.COI_DETECTION_ENABLED !== false;
