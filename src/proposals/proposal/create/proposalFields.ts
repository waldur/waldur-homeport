import { get } from 'es-toolkit/compat';

import { isEmpty } from '@/core/utils';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import {
  ProposalFieldConfig,
  ProposalFieldName,
  ProposalFieldState,
} from '@/proposals/types';

/**
 * Character limits of the Project details fields, mirroring the backend: name
 * is the model's `max_length`, description DESCRIPTION_LENGTH
 * (waldur_core.core.models), the description column's size, and summary
 * PROJECT_SUMMARY_LENGTH (proposal.models). The serializers refuse anything
 * longer.
 */
export const PROPOSAL_FIELD_MAX_LENGTH = {
  name: 150,
  project_summary: 1000,
  description: 4096,
} as const;

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
 *
 * A science domain the call requires is asked for whatever the
 * project.science_domain feature says: the backend refuses the proposal
 * without one, so hiding it left a required field nobody could fill. One the
 * call merely offers follows the feature, as the project forms do, so a
 * deployment without science domains shows no picker on every proposal.
 */
export const getFieldStates = (
  config?: ProposalFieldConfig,
  scienceDomainsEnabled = isFeatureVisible(ProjectFeatures.science_domain),
): Record<ProposalFieldName, ProposalFieldState> => {
  const scienceSubDomain = config?.field_science_sub_domain ?? 'optional';
  return {
    project_summary: config?.field_project_summary ?? 'required',
    description: config?.field_description ?? 'optional',
    science_sub_domain:
      scienceSubDomain === 'optional' && !scienceDomainsEnabled
        ? 'hidden'
        : scienceSubDomain,
    supporting_documentation:
      config?.field_supporting_documentation ?? 'optional',
  };
};

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
/* `name` brackets every list below: it is always asked and always required —
 * it identifies the proposal and goes into the awarded project's name (see
 * getProposalProjectName).
 *
 * The project duration is asked only of a call that offers a list of lengths
 * (`allowed_duration_months`), and is then required. Elsewhere allocation
 * derives it from the subscriptions requested and the call's fixed duration
 * (see projectDuration.ts), so a field there would count towards a total the
 * applicant has no way to fill. */
export const getTrackedFields = (
  states: Record<ProposalFieldName, ProposalFieldState>,
  asksDuration = false,
): string[] => [
  'name',
  ...CONFIGURABLE_FIELDS.filter((field) => isFieldVisible(states, field)),
  ...(asksDuration ? [DURATION_FIELD] : []),
];

export const getRequiredFields = (
  states: Record<ProposalFieldName, ProposalFieldState>,
  asksDuration = false,
): string[] => [
  'name',
  ...CONFIGURABLE_FIELDS.filter((field) => isFieldRequired(states, field)),
  ...(asksDuration ? [DURATION_FIELD] : []),
];

export const DURATION_FIELD = 'requested_duration_months';

/**
 * Whether a Project details field counts as filled, for the step's
 * "{filled}/{total}" counter and for whether a required field still blocks
 * submission, so the two cannot disagree.
 *
 * The form value of supporting_documentation holds only files not yet
 * uploaded: Save as draft sends them and clears it, after which they live on
 * the proposal. Counting the form alone leaves the step short of its total,
 * and a call that requires documents never completes after a save.
 */
export const isProposalFieldFilled = (
  field: string,
  values: Record<string, any> | undefined,
  proposal?: { supporting_documentation?: unknown[] | null } | null,
): boolean => {
  if (
    field === 'supporting_documentation' &&
    proposal?.supporting_documentation?.length
  ) {
    return true;
  }
  const value = get(values ?? {}, field);
  return typeof value === 'object' ? !isEmpty(value) : Boolean(value);
};

/** Whether the call lets the applicant choose the project's length. */
export const asksForDuration = (call?: {
  allowed_duration_months?: number[] | null;
}): boolean => Boolean(call?.allowed_duration_months?.length);

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
