import { isEqual } from 'es-toolkit';
import {
  PostAwardStatusEnum,
  ProposalRun,
  ProposalRunStateEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { Proposal } from '@/proposals/types';

export const POST_AWARD_SECTION_ID = 'step-post-award';

/** The dashboard wording of an accepted proposal's post-award work. */
export const postAwardStatusLabel = (status: PostAwardStatusEnum): string =>
  ({
    // Opened, with the team still to answer its questions and submit it:
    // "submitted" said the team was done when it had just begun.
    extension_requested: translate('Extension request open'),
    extension_in_assessment: translate('Pending extension request assessment'),
    extension_pending_results: translate('Pending extension request results'),
    project_extended: translate('Project extended'),
    pending_final_report: translate('Pending final report'),
    final_report_submitted: translate('Final report submitted'),
    project_completed: translate('Project completed'),
  })[status] ?? status;

export const runPhaseLabel = (phase: ProposalRun['phase']): string =>
  phase === 'closing'
    ? translate('Final report')
    : phase === 'extension'
      ? translate('Extension request')
      : phase;

export const runStateLabel = (state: ProposalRunStateEnum): string =>
  ({
    open: translate('Open'),
    approved: translate('Approved'),
    rejected: translate('Rejected'),
    withdrawn: translate('Withdrawn'),
    expired: translate('Expired'),
  })[state] ?? state;

type PostAwardProposal = Pick<
  Proposal,
  | 'state'
  | 'completed_at'
  | 'open_run_uuid'
  | 'extension_requestable_until'
  | 'final_report_openable'
>;

/**
 * Whether the viewer may ask for an extension now -- one of the proposal's
 * managers, who act for the applicant (the backend's acts_for_applicant): accepted, not
 * completed, no run open, and the call takes requests until a day not yet
 * passed. The backend decides; this only offers the button.
 */
export const canRequestExtension = (
  proposal: PostAwardProposal,
  actsForApplicant: boolean,
  today: Date = new Date(),
): boolean => {
  if (!actsForApplicant || proposal.state !== 'accepted') return false;
  if (proposal.completed_at || proposal.open_run_uuid) return false;
  const until = proposal.extension_requestable_until;
  if (!until) return false;
  return today.toISOString().slice(0, 10) <= until;
};

/** Whether whoever drives the call may open the final report now: the
 * backend says it can be opened, which includes the call having final
 * report steps at all. */
export const canOpenFinalReport = (
  proposal: PostAwardProposal,
  drivesCall: boolean,
): boolean =>
  drivesCall &&
  proposal.state === 'accepted' &&
  !proposal.completed_at &&
  !proposal.open_run_uuid &&
  !!proposal.final_report_openable;

/**
 * Who may change what an open extension says: the team what it asks for
 * while its request is being written, whoever decides what it grants while
 * the decision runs.
 */
export const runEditMode = (
  run: Pick<ProposalRun, 'phase' | 'state' | 'active_step_kind'>,
  {
    actsForApplicant,
    drivesCall,
    requestUnlocked = false,
  }: {
    actsForApplicant: boolean;
    drivesCall: boolean;
    requestUnlocked?: boolean;
  },
): 'request' | 'grant' | null => {
  if (run.phase !== 'extension' || run.state !== 'open') return null;
  if (
    actsForApplicant &&
    (run.active_step_kind === 'applicant_action' || requestUnlocked)
  ) {
    return 'request';
  }
  if (drivesCall && !actsForApplicant && run.active_step_kind === 'decision') {
    return 'grant';
  }
  return null;
};

/** Whether the viewer may call off the run: the team its own request while
 * writing it, whoever drives the call any open run. */
export const canWithdrawRun = (
  run: Pick<ProposalRun, 'phase' | 'state' | 'active_step_kind'>,
  {
    actsForApplicant,
    drivesCall,
  }: { actsForApplicant: boolean; drivesCall: boolean },
): boolean => {
  if (run.state !== 'open') return false;
  if (drivesCall && !actsForApplicant) return true;
  return (
    actsForApplicant &&
    run.phase === 'extension' &&
    run.active_step_kind === 'applicant_action'
  );
};

/** Limits per resource as the form edits them: amounts as numbers, empty
 * components dropped, resources without any left out. */
export const cleanRunLimits = (
  limits: Record<string, Record<string, unknown>> | undefined,
): Record<string, Record<string, number>> => {
  const cleaned: Record<string, Record<string, number>> = {};
  Object.entries(limits ?? {}).forEach(([resource, components]) => {
    const amounts: Record<string, number> = {};
    Object.entries(components ?? {}).forEach(([component, value]) => {
      if (value === '' || value === null || value === undefined) return;
      const amount = Number(value);
      if (!Number.isNaN(amount)) amounts[component] = amount;
    });
    if (Object.keys(amounts).length) cleaned[resource] = amounts;
  });
  return cleaned;
};

type RunGrant = Pick<
  ProposalRun,
  | 'requested_end_date'
  | 'requested_limits'
  | 'granted_end_date'
  | 'granted_limits'
>;

const asRunLimits = (limits: ProposalRun['granted_limits']) =>
  cleanRunLimits(limits as Record<string, Record<string, unknown>>);

/** Whether the decision has granted anything on the run yet. */
export const isRunGranted = (run: RunGrant): boolean =>
  Boolean(run.granted_end_date) ||
  Object.keys(asRunLimits(run.granted_limits)).length > 0;

/**
 * Whether what the decision grants is not what the extension asked for:
 * another end date, or other limits. Nothing granted yet differs from
 * nothing.
 */
export const runGrantDiffers = (run: RunGrant): boolean =>
  isRunGranted(run) &&
  ((run.granted_end_date ?? null) !== (run.requested_end_date ?? null) ||
    !isEqual(
      asRunLimits(run.granted_limits),
      asRunLimits(run.requested_limits),
    ));

/**
 * Whether the changes asked of the team unlock ``part`` of the proposal's
 * open run: its applicant step's answers (``run_form``) or what an extension
 * asks for (``run_request``). Run parts are only ever unlocked at a step of
 * the open run.
 */
export const runPartUnlocked = (
  proposal: Pick<Proposal, 'open_change_requests' | 'open_run_uuid'>,
  part: 'run_form' | 'run_request',
): boolean =>
  Boolean(
    proposal.open_run_uuid &&
    proposal.open_change_requests?.some((request) =>
      request.unlocked_parts?.includes(part),
    ),
  );
