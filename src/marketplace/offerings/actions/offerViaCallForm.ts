import { translate } from '@/i18n';

export interface OfferViaCallFormData {
  name: string;
  cutoff_time: string;
  plan: { value: string; label: string };
  manager: { uuid: string; name: string };
  /** Enabled state per workflow step key. */
  steps: Record<string, boolean>;
}

interface SeededStep {
  key: string;
  name: string;
  description: string;
  mandatory: boolean;
}

/**
 * Which steps a new call may run: the steps the backend seeds every new call
 * with, by the keys it seeds them under. The call does not exist yet when
 * the choice is made, so there are no call steps to read; anything beyond
 * these is added in call configuration the moment this wizard closes.
 *
 * The award response is left out: the backend does not seed it, and it is
 * added in call configuration as an applicant step.
 */
export const selectableSteps = (): SeededStep[] => [
  {
    key: 'administrative_check',
    name: translate('Administrative check'),
    description: translate(
      'Eligibility and completeness validation before evaluation.',
    ),
    mandatory: false,
  },
  {
    key: 'technical_assessment',
    name: translate('Technical assessment'),
    description: translate(
      'Service provider verifies technical feasibility of the proposal.',
    ),
    mandatory: false,
  },
  {
    key: 'expert_review',
    name: translate('Expert review'),
    description: translate(
      'Independent peer review by domain experts with scoring.',
    ),
    mandatory: false,
  },
  {
    key: 'panel_review',
    name: translate('Panel review'),
    description: translate(
      'Collective panel evaluation consolidating expert reviews.',
    ),
    mandatory: false,
  },
  {
    key: 'allocation_decision',
    name: translate('Allocation decision'),
    description: translate(
      'Final decision to approve or reject the proposal and allocate resources.',
    ),
    mandatory: true,
  },
];

/**
 * The workflow a new call starts from: only what it cannot do without.
 *
 * Every extra step is a stage somebody has to clear before the request can be
 * granted, and this action exists to make an offering requestable rather than
 * to build a review process — so the operator opts into those rather than out.
 */
export const defaultSteps = (): Record<string, boolean> =>
  Object.fromEntries(
    selectableSteps().map((step) => [step.key, step.mandatory]),
  );

/** The enabled step keys, in the shape the offerViaCall chain expects. */
export const enabledStepIds = (steps: Record<string, boolean> = {}) =>
  Object.entries(steps)
    .filter(([, enabled]) => enabled)
    .map(([id]) => id);
