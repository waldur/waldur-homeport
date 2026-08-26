import {
  ProposalFieldConfig,
  ProposalFieldName,
  ProposalFieldState,
} from '@/proposals/types';

/** Fields the call can configure, in the order the form renders them. */
const CONFIGURABLE_FIELDS: ProposalFieldName[] = [
  'project_summary',
  'description',
  'science_sub_domain',
  'supporting_documentation',
];

/**
 * What the call asks for, defaulting to the pre-configuration behaviour.
 *
 * The default matters for more than old calls: the applicant form reads the
 * public call, and a request that has not resolved yet, or a deployment whose
 * backend predates the config, must still render a usable form rather than an
 * empty one.
 */
export const getFieldStates = (
  config?: ProposalFieldConfig,
): Record<ProposalFieldName, ProposalFieldState> => ({
  project_summary: config?.field_project_summary ?? 'required',
  description: config?.field_description ?? 'optional',
  science_sub_domain: config?.field_science_sub_domain ?? 'optional',
  supporting_documentation:
    config?.field_supporting_documentation ?? 'optional',
});

export const isFieldVisible = (
  states: Record<ProposalFieldName, ProposalFieldState>,
  field: ProposalFieldName,
): boolean => states[field] !== 'hidden';

export const isFieldRequired = (
  states: Record<ProposalFieldName, ProposalFieldState>,
  field: ProposalFieldName,
): boolean => states[field] === 'required';

/** Fields the Project details step tracks for its filled/total counter — the
 * ones actually rendered, so the count can reach its own total. */
/* `name` and `duration_in_days` bracket every list below: they are always asked
 * and always required. The name identifies the proposal and forms the last
 * third of the awarded project's name (see getProposalProjectName), and the
 * duration states the length of the award. */
export const getTrackedFields = (
  states: Record<ProposalFieldName, ProposalFieldState>,
): string[] => [
  'name',
  ...CONFIGURABLE_FIELDS.filter((field) => isFieldVisible(states, field)),
  'duration_in_days',
];

export const getRequiredFields = (
  states: Record<ProposalFieldName, ProposalFieldState>,
): string[] => [
  'name',
  ...CONFIGURABLE_FIELDS.filter((field) => isFieldRequired(states, field)),
  'duration_in_days',
];

/**
 * Whether a read-only view should render a configurable field.
 *
 * A field the call does not ask for is skipped — unless the proposal already
 * carries a value for it, which happens when the call dropped the field after
 * that proposal was written. Reviewers and managers keep seeing what an
 * applicant actually submitted; nothing new is offered for a question the call
 * no longer asks.
 */
export const shouldRenderField = (
  states: Record<ProposalFieldName, ProposalFieldState>,
  field: ProposalFieldName,
  value: unknown,
): boolean => {
  if (isFieldVisible(states, field)) {
    return true;
  }
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
};
