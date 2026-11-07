import { OfferingAssessment } from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  contributionOutcomeLabel,
  contributionStatusLabel,
} from '@/proposals/workflow/constants';

type Assessment = Pick<
  OfferingAssessment,
  'call_step_uuid' | 'offering_name' | 'status' | 'outcome'
>;

/** One requested offering's result at a per-offering step. */
interface OfferingResult {
  offering: string;
  result: string;
}

export interface StepOfferingResults {
  /** "1 accepted, 1 rejected": what the step concluded, per offering. */
  summary: string;
  results: OfferingResult[];
}

const resultOf = (assessment: Assessment): string =>
  assessment.status === 'submitted' && assessment.outcome
    ? contributionOutcomeLabel(assessment.outcome)
    : contributionStatusLabel(assessment.status);

const countLabel = (key: string, count: number): string => {
  switch (key) {
    case 'accepted':
      return translate('{count} accepted', { count });
    case 'conditionally_accepted':
      return translate('{count} conditionally accepted', { count });
    case 'rejected':
      return translate('{count} rejected', { count });
    default:
      return translate('{count} pending', { count });
  }
};

const SUMMARY_ORDER = [
  'accepted',
  'conditionally_accepted',
  'rejected',
  'pending',
];

/**
 * What each per-offering step concluded about each requested offering, by
 * call step: the aggregate word ("Infeasible") says one offering was
 * rejected, not that the proposal stopped -- the others go on. Built only
 * from the assessments the viewer already reads.
 */
export const getStepOfferingResults = (
  assessments: Assessment[] | undefined,
): Record<string, StepOfferingResults> => {
  const byStep: Record<string, Assessment[]> = {};
  for (const assessment of assessments ?? []) {
    (byStep[assessment.call_step_uuid] ??= []).push(assessment);
  }
  const results: Record<string, StepOfferingResults> = {};
  for (const [stepUuid, rows] of Object.entries(byStep)) {
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const key =
        row.status === 'submitted' && row.outcome ? row.outcome : 'pending';
      counts[key] = (counts[key] ?? 0) + 1;
    }
    results[stepUuid] = {
      summary: SUMMARY_ORDER.filter((key) => counts[key])
        .map((key) => countLabel(key, counts[key]))
        .join(', '),
      results: rows.map((row) => ({
        offering: row.offering_name,
        result: resultOf(row),
      })),
    };
  }
  return results;
};
