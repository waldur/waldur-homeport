import { DryRunViewAsResult } from 'waldur-js-client';

import { translate } from '@/i18n';

const okData = (view: DryRunViewAsResult, key: string): any[] => {
  const read = view.responses[key];
  return read && read.status === 200 && Array.isArray(read.data)
    ? read.data
    : [];
};

/** The reviews the viewer reads anywhere in the preview's responses. */
const reviewsRead = (view: DryRunViewAsResult) => {
  const reviews: any[] = [];
  Object.keys(view.responses)
    .filter((key) => key.startsWith('step_inputs:'))
    .forEach((key) =>
      okData(view, key).forEach((output) =>
        reviews.push(...(output.reviews ?? [])),
      ),
    );
  reviews.push(...okData(view, 'reviews'));
  return reviews;
};

/**
 * What the visibility rules did to this role's view, spelled out beside the
 * preview: whether it sees the proposal at all, reviewer names, outcomes
 * and step names.
 */
export const previewFacts = (view: DryRunViewAsResult): string[] => {
  const proposal = view.responses.proposal;
  if (!proposal || proposal.status !== 200) {
    return [translate('This role does not see the proposal at all.')];
  }
  const facts: string[] = [];
  const states = okData(view, 'workflow_states');
  const decided = states.filter((row) => row.status === 'completed');
  const hiddenOutcomes = decided.filter((row) => !row.outcome).length;
  if (decided.length) {
    facts.push(
      !hiddenOutcomes
        ? translate('Outcomes shown on every completed step.')
        : decided.length === 1
          ? translate('Outcome hidden on the only completed step.')
          : translate('Outcome hidden on {count} of {total} completed steps.', {
              count: hiddenOutcomes,
              total: decided.length,
            }),
    );
  }
  const internal = states.filter(
    (row) => row.status !== 'skipped' && row.applicant_visible === false,
  ).length;
  if (internal && view.role === 'applicant') {
    facts.push(
      internal === 1
        ? translate('1 step reads as "Internal check".')
        : translate('{count} steps read as "Internal check".', {
            count: internal,
          }),
    );
  }
  const reviews = reviewsRead(view);
  if (reviews.length) {
    const named = reviews.filter((review) => review.reviewer_full_name).length;
    facts.push(
      !named
        ? translate('Reviewer names hidden on every review.')
        : reviews.length === 1
          ? translate('Reviewer name shown on the only review.')
          : translate('Reviewer names shown on {count} of {total} reviews.', {
              count: named,
              total: reviews.length,
            }),
    );
  }
  return facts;
};
