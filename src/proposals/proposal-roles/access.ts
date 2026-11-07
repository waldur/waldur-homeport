import {
  ProposalRoleAssignment,
  ProposalWorkflowStepInstance,
  User,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { isOnProposalTeam } from '@/proposals/team/teamRules';
import { Proposal } from '@/proposals/types';

type AccessUser = Pick<User, 'uuid' | 'is_staff' | 'permissions'>;

type AccessProposal = Pick<
  Proposal,
  | 'uuid'
  | 'state'
  | 'call_uuid'
  | 'call_managing_organisation_uuid'
  | 'created_by_uuid'
>;

type AccessStep = Pick<
  ProposalWorkflowStepInstance,
  'kind' | 'completer' | 'completer_proposal_role_uuid'
> &
  Partial<
    Pick<
      ProposalWorkflowStepInstance,
      'contributors_lead_only' | 'contributor_proposal_role_uuid'
    >
  >;

/** The call role behind each completer that is one. */
const COMPLETER_CALL_ROLES: Record<string, string> = {
  call_manager: 'CALL.MANAGER',
  panel_member: 'CALL.PANEL_MEMBER',
  reviewer: 'CALL.REVIEWER',
};

export interface EvaluatorAccess {
  /** Assign, revoke and move the lead of the proposal's evaluators. */
  canManageEvaluators: boolean;
  /** See who evaluates the proposal. */
  canViewEvaluators: boolean;
  /** Complete the active step, without managing the call. */
  completesActiveStep: boolean;
}

/**
 * What the viewer may do with a proposal's evaluator roles. Mirrors the
 * backend, which decides every request again: the whole applicant team --
 * its author and anyone holding a role on it -- never sees or picks its
 * evaluators, whatever else they hold; those overseeing the call manage
 * them at any time, the completer of an assignment step while it runs; a
 * holder sees who else evaluates.
 *
 * `heldRoles` are the viewer's assignments on the proposal that give access,
 * i.e. not waiting for their conflict-of-interest confirmation.
 */
export const evaluatorAccess = ({
  user,
  proposal,
  activeStep,
  heldRoles,
}: {
  user: AccessUser | null | undefined;
  proposal: AccessProposal;
  activeStep: AccessStep | undefined;
  heldRoles: (Pick<ProposalRoleAssignment, 'role_uuid'> &
    Partial<Pick<ProposalRoleAssignment, 'is_lead'>>)[];
}): EvaluatorAccess => {
  if (!user) {
    return {
      canManageEvaluators: false,
      canViewEvaluators: false,
      completesActiveStep: false,
    };
  }
  const onApplicantTeam = isOnProposalTeam(user, proposal);
  const completerCallRole = COMPLETER_CALL_ROLES[activeStep?.completer ?? ''];
  // The role itself, not staff standing in for it: staff manage the call
  // from its own pages.
  const holdsCompleterCallRole =
    !!completerCallRole &&
    Boolean(
      user.permissions?.some(
        (permission) =>
          permission.role_name === completerCallRole &&
          permission.scope_uuid === proposal.call_uuid,
      ),
    );
  // On a step its role's lead alone contributes to, the lead alone
  // completes it, as the backend decides.
  const leadCompletes =
    !!activeStep?.contributors_lead_only &&
    activeStep.contributor_proposal_role_uuid ===
      activeStep.completer_proposal_role_uuid;
  const completesAsEvaluator =
    activeStep?.completer === 'proposal_role' &&
    heldRoles.some(
      (a) =>
        a.role_uuid === activeStep.completer_proposal_role_uuid &&
        (!leadCompletes || !!a.is_lead),
    );
  const canManageEvaluators =
    !onApplicantTeam &&
    (Boolean(
      hasPermission(user, {
        permission: PermissionEnum.UPDATE_CALL,
        scopeId: proposal.call_uuid,
        callOrganizerId: proposal.call_managing_organisation_uuid,
      }),
    ) ||
      (activeStep?.kind === 'assignment' && holdsCompleterCallRole));
  return {
    canManageEvaluators,
    canViewEvaluators:
      !onApplicantTeam && (canManageEvaluators || heldRoles.length > 0),
    // Call managers act on steps from the call's own pages.
    completesActiveStep:
      !onApplicantTeam &&
      activeStep?.completer !== 'applicant' &&
      (completesAsEvaluator ||
        (holdsCompleterCallRole && activeStep?.completer !== 'call_manager')),
  };
};

/**
 * Whether the viewer may change any holder of the proposal's evaluator roles
 * and move any lead: staff, and those overseeing the call while not on the
 * applicant team. Anyone else managing the roles -- the completer of a
 * running assignment step, often a panel member or a holder themselves -- is
 * a peer of those they assign: they add holders and give up their own role,
 * but take neither the lead nor anyone else's role.
 */
export const changesAnyHolder = (
  user: AccessUser | null | undefined,
  proposal: AccessProposal,
): boolean => {
  if (!user) return false;
  if (user.is_staff) return true;
  if (isOnProposalTeam(user, proposal)) return false;
  return Boolean(
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_CALL,
      scopeId: proposal.call_uuid,
      callOrganizerId: proposal.call_managing_organisation_uuid,
    }),
  );
};

type Holder = Pick<ProposalRoleAssignment, 'uuid' | 'user_uuid' | 'is_lead'>;

/**
 * Why the viewer may not make someone the lead of a role, or undefined when
 * they may: a peer only while the role has no lead, or as its lead handing
 * it over. `holders` are the role's current holders; `to` the holder made
 * the lead, when already one.
 */
export const moveLeadRefusal = ({
  changesAny,
  userUuid,
  holders,
  to,
}: {
  changesAny: boolean;
  userUuid: string | undefined;
  holders: Holder[];
  to?: Holder;
}): string | undefined => {
  if (changesAny) return undefined;
  const lead = holders.find((holder) => holder.is_lead);
  if (!lead || lead.user_uuid === userUuid || lead.uuid === to?.uuid) {
    return undefined;
  }
  return translate(
    'The role has a lead: only its lead hands it over, or the call manager moves it.',
  );
};

/**
 * Why the viewer may not take `holder`'s role away, or undefined when they
 * may: a peer gives up only their own.
 */
export const revokeHolderRefusal = ({
  changesAny,
  userUuid,
  holder,
}: {
  changesAny: boolean;
  userUuid: string | undefined;
  holder: Holder;
}): string | undefined =>
  changesAny || holder.user_uuid === userUuid
    ? undefined
    : translate('Only the call manager takes a role away from someone else.');
