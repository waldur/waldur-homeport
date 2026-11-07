import { StepAudienceStatusLabels, StepStatusLabels } from 'waldur-js-client';

import { translate } from '@/i18n';

export const STATUS_LABEL_AUDIENCES = [
  'applicant',
  'evaluators',
  'call_team',
  'offering_team',
] as const;

export type StatusLabelAudience = (typeof STATUS_LABEL_AUDIENCES)[number];

/**
 * Counts a label other than the applicant's may show, filled per proposal
 * by the backend from the step's work. Mirrors the backend's list.
 */
export const STATUS_LABEL_PLACEHOLDERS = [
  'invited',
  'accepted',
  'declined',
  'submitted',
  'expected',
  'reports_submitted',
  'reports_expected',
] as const;

const PLACEHOLDER = /\{([^{}]*)\}/g;

/**
 * Why the backend would refuse a label text for an audience, or undefined:
 * anything in braces must be a known count, and the applicant's labels take
 * none, so the applicant is not told how their evaluation is staffed.
 */
export const statusLabelProblem = (
  audience: StatusLabelAudience,
  text: string | null | undefined,
): string | undefined => {
  const names = Array.from((text ?? '').matchAll(PLACEHOLDER), (m) => m[1]);
  if (!names.length) return undefined;
  if (audience === 'applicant') {
    return translate(
      "The applicant's labels cannot show counts: the applicant is not told how their evaluation is staffed.",
    );
  }
  const unknown = names.filter(
    (name) => !(STATUS_LABEL_PLACEHOLDERS as readonly string[]).includes(name),
  );
  if (unknown.length) {
    return translate('Unknown placeholder: {names}. Use {allowed}.', {
      names: unknown.map((name) => `{${name}}`).join(', '),
      allowed: STATUS_LABEL_PLACEHOLDERS.map((name) => `{${name}}`).join(', '),
    });
  }
  return undefined;
};

const STATES = ['active', 'completed', 'changes_requested'] as const;

const cleanAudience = (
  entry: StepAudienceStatusLabels | undefined,
): StepAudienceStatusLabels | undefined => {
  if (!entry) return undefined;
  const result: StepAudienceStatusLabels = {};
  for (const state of STATES) {
    const text = (entry[state] ?? '').trim();
    if (text) result[state] = text;
  }
  const outcomes = Object.fromEntries(
    Object.entries(entry.outcomes ?? {})
      .map(([outcome, text]) => [outcome, (text ?? '').trim()])
      .filter(([, text]) => text),
  );
  if (Object.keys(outcomes).length) result.outcomes = outcomes;
  return Object.keys(result).length ? result : undefined;
};

/**
 * The status labels a step is saved with: texts trimmed, and an empty text
 * left out, so the computed label stays for it.
 */
export const cleanStatusLabels = (
  labels: StepStatusLabels | null | undefined,
): StepStatusLabels => {
  const result: StepStatusLabels = {};
  for (const audience of STATUS_LABEL_AUDIENCES) {
    const entry = cleanAudience(labels?.[audience]);
    if (entry) result[audience] = entry;
  }
  return result;
};

/**
 * Whether a step's applicant labels reach the applicant team: on a step
 * visible to them, on the allocation decision, and on the decision closing
 * an extension request or final report, whose outcomes they learn either
 * way. Mirrors the backend's rule.
 */
export const applicantLabelsApply = (step: {
  applicant_visible?: boolean | null;
  is_allocation_decision?: boolean | null;
  kind?: string | null;
  phase?: string | null;
}): boolean =>
  Boolean(
    step.applicant_visible ||
    step.is_allocation_decision ||
    (step.kind === 'decision' &&
      (step.phase === 'extension' || step.phase === 'closing')),
  );

/** How many labels a step configures, over every audience. */
export const countStatusLabels = (
  labels: StepStatusLabels | null | undefined,
): number =>
  STATUS_LABEL_AUDIENCES.reduce((count, audience) => {
    const entry = cleanAudience(labels?.[audience]);
    if (!entry) return count;
    return (
      count +
      STATES.filter((state) => entry[state]).length +
      Object.keys(entry.outcomes ?? {}).length
    );
  }, 0);
