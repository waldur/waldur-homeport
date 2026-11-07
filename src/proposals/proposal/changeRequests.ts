import {
  ProposalChangeRequest,
  ProposalWorkflowStepInstance,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { Proposal } from '@/proposals/types';

/** A Project details field is unlocked as `field:<name>`. */
const FIELD_PREFIX = 'field:';

export const fieldPart = (name: string) => `${FIELD_PREFIX}${name}`;

type ChangeRequestProposal = Pick<Proposal, 'state'> &
  Partial<Pick<Proposal, 'open_change_requests'>>;

/**
 * The changes asked of the applicant and not yet submitted, earliest first:
 * several steps of a stage may each ask at once.
 */
export const getOpenChangeRequests = (
  proposal: ChangeRequestProposal | undefined,
): ProposalChangeRequest[] =>
  proposal?.state === 'in_review' ? (proposal.open_change_requests ?? []) : [];

const sameUuid = (a?: string | null, b?: string | null) =>
  !!a && !!b && a.replace(/-/g, '') === b.replace(/-/g, '');

/**
 * Whether `request` was made at `step`: with several steps of a stage
 * running at once, each waits on its own request only.
 */
const isRequestOfStep = (
  request: Pick<ProposalChangeRequest, 'step_uuid'> | null | undefined,
  step: Pick<ProposalWorkflowStepInstance, 'uuid'> | null | undefined,
): boolean => sameUuid(request?.step_uuid, step?.uuid);

/** The open request made at `step`, if it has one. */
export const getStepChangeRequest = (
  proposal: ChangeRequestProposal | undefined,
  step: Pick<ProposalWorkflowStepInstance, 'uuid'> | null | undefined,
): ProposalChangeRequest | null =>
  getOpenChangeRequests(proposal).find((request) =>
    isRequestOfStep(request, step),
  ) ?? null;

/**
 * Whether the applicant may edit `part` of the proposal now: every part of
 * a draft, and afterwards only what one of the open requests for changes
 * unlocks. Mirrors the backend's applicant_may_edit, which has the last word.
 */
export const isPartEditable = (
  proposal: ChangeRequestProposal | undefined,
  part: string,
): boolean => {
  if (!proposal) return false;
  if (proposal.state === 'draft') return true;
  return getOpenChangeRequests(proposal).some((request) =>
    request.unlocked_parts.includes(part),
  );
};

/** Whether any Project details field is unlocked by one of `requests`. */
export const anyFieldUnlocked = (requests: ProposalChangeRequest[]) =>
  requests.some((request) =>
    request.unlocked_parts.some((part) => part.startsWith(FIELD_PREFIX)),
  );

export const changeRequestPartLabel = (part: string): string => {
  switch (part) {
    case fieldPart('name'):
      return translate('Name');
    case fieldPart('project_summary'):
      return translate('Summary');
    case fieldPart('description'):
      return translate('Description');
    case fieldPart('science_sub_domain'):
      return translate('Science domain');
    case fieldPart('requested_duration_months'):
      return translate('Project duration');
    case 'documents':
      return translate('Supporting documentation');
    case 'resources':
      return translate('Resource requests');
    case 'team':
      return translate('Project team');
    case 'compliance':
      return translate('Compliance checklist');
    case 'run_form':
      return translate('Form answers');
    case 'run_request':
      return translate('Requested end date and resources');
    default:
      return part;
  }
};
