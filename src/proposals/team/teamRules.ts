import { User, UserRoleDetails } from 'waldur-js-client';

import { translate } from '@/i18n';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { getProposalRoles } from '@/permissions/utils';
import { Proposal } from '@/proposals/types';

type TeamUser = Pick<User, 'uuid' | 'is_staff' | 'permissions'>;

type TeamProposal = Pick<
  Proposal,
  | 'uuid'
  | 'state'
  | 'call_uuid'
  | 'call_managing_organisation_uuid'
  | 'created_by_uuid'
>;

type TeamChange = 'grant' | 'revoke';

/**
 * Roles that only the proposal's managers, those overseeing its call and
 * staff may grant or revoke: the manager role itself and the administrator
 * role, which edits the proposal.
 */
const ROLES_MANAGED_BY_MANAGERS = [
  RoleEnum.PROPOSAL_MANAGER,
  RoleEnum.PROPOSAL_ADMIN,
];

/** Events shown in a team's change log. On a proposal the backend marks
 * those made after submission in their context and message. */
export const TEAM_EVENT_TYPES = [
  'role_granted',
  'role_revoked',
  'role_updated',
];

/** Staff (through hasPermission), or whoever may update the proposal's
 * call: a call manager on the call or a call organiser on its managing
 * organisation. */
export const canOverseeProposal = (
  user: Pick<User, 'is_staff' | 'permissions'>,
  proposal: Pick<TeamProposal, 'call_uuid' | 'call_managing_organisation_uuid'>,
): boolean =>
  Boolean(user && proposal) &&
  Boolean(
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_CALL,
      scopeId: proposal.call_uuid,
      callOrganizerId: proposal.call_managing_organisation_uuid,
    }),
  );

const holdsProposalRole = (
  user: TeamUser,
  proposal: Pick<TeamProposal, 'uuid'>,
  roleName?: string,
) =>
  Boolean(
    user?.permissions?.some(
      (permission) =>
        permission.scope_type === 'proposal' &&
        permission.scope_uuid === proposal.uuid &&
        (!roleName || permission.role_name === roleName),
    ),
  );

// The backend admits the proposal's creator alongside the permission holders
// (and staff, whom hasPermission already lets through).
const holdsOnProposal = (
  user: TeamUser,
  proposal: TeamProposal,
  permission: string,
) =>
  (Boolean(user?.uuid) && user.uuid === proposal.created_by_uuid) ||
  Boolean(hasPermission(user, { permission, scopeId: proposal.uuid }));

/**
 * Edit the proposal's content (details, requested resources, documents,
 * checklist answers): what the backend saves on PROPOSAL.UPDATE, held by its
 * managers and administrators, plus its creator and staff.
 */
export const canEditProposal = (user: TeamUser, proposal: TeamProposal) =>
  Boolean(user && proposal) &&
  holdsOnProposal(user, proposal, PermissionEnum.UPDATE_PROPOSAL);

/** Submit the proposal: PROPOSAL.MANAGE (its managers), its creator and
 * staff. Submitting saves the form first, so it takes edit rights too; an
 * administrator edits but leaves submitting to a manager. */
export const canSubmitProposal = (user: TeamUser, proposal: TeamProposal) =>
  canEditProposal(user, proposal) &&
  holdsOnProposal(user, proposal, PermissionEnum.MANAGE_PROPOSAL);

/** Manage the team at all (its invitations and change log included): its
 * managers (PROPOSAL.MANAGE), those overseeing the call, and staff. */
export const canManageProposalTeam = (user: TeamUser, proposal: TeamProposal) =>
  Boolean(user && proposal) &&
  (canOverseeProposal(user, proposal) ||
    Boolean(
      hasPermission(user, {
        permission: PermissionEnum.MANAGE_PROPOSAL,
        scopeId: proposal.uuid,
      }),
    ));

/** Whether the user is on the applicant side of the proposal: its creator
 * or the holder of any role on it. */
export const isOnProposalTeam = (user: TeamUser, proposal: TeamProposal) =>
  Boolean(user && proposal) &&
  (user.uuid === proposal.created_by_uuid || holdsProposalRole(user, proposal));

/**
 * Mirrors the backend's team rules for a proposal:
 * - staff and those overseeing its call (call managers, call organisers)
 *   may change any proposal role at any time;
 * - while it is a draft, its managers may change any role; the manager and
 *   administrator roles are reserved to them, while other roles also follow
 *   the team permission;
 * - once submitted, the team is fixed for the applicant.
 */
export const canChangeProposalRole = (
  user: TeamUser,
  proposal: TeamProposal,
  roleName: string,
  change: TeamChange,
): boolean => {
  if (!user || !proposal) {
    return false;
  }
  // Staff pass as overseers: hasPermission lets them through.
  if (canOverseeProposal(user, proposal)) {
    return true;
  }
  if (proposal.state !== 'draft') {
    return false;
  }
  if (holdsProposalRole(user, proposal, RoleEnum.PROPOSAL_MANAGER)) {
    return true;
  }
  if (ROLES_MANAGED_BY_MANAGERS.includes(roleName)) {
    return false;
  }
  return Boolean(
    hasPermission(user, {
      permission:
        change === 'grant'
          ? PermissionEnum.MANAGE_PROPOSAL
          : PermissionEnum.DELETE_PROPOSAL_PERMISSION,
      scopeId: proposal.uuid,
    }),
  );
};

/** As `canChangeProposalRole` for one team row. Nobody, staff included,
 * changes their own role on a proposal. */
export const canRevokeProposalRow = (
  user: TeamUser,
  proposal: TeamProposal,
  row: Pick<UserRoleDetails, 'user_uuid' | 'role_name'>,
): boolean =>
  Boolean(row?.user_uuid) &&
  row.user_uuid !== user?.uuid &&
  canChangeProposalRole(user, proposal, row.role_name, 'revoke');

/** Proposal roles the user may grant on this proposal, in catalogue order. */
export const getGrantableProposalRoleNames = (
  user: TeamUser,
  proposal: TeamProposal,
): string[] =>
  getProposalRoles()
    .map((role) => role.name)
    .filter((roleName) =>
      canChangeProposalRole(user, proposal, roleName, 'grant'),
    );

/** Whether any row of the team may be revoked by the user. */
export const canRevokeAnyProposalRole = (
  user: TeamUser,
  proposal: TeamProposal,
): boolean =>
  getProposalRoles().some((role) =>
    canChangeProposalRole(user, proposal, role.name, 'revoke'),
  );

/** Invite someone by mail: staff and those overseeing the call at any
 * time, the team permission while the proposal is a draft. */
export const canInviteToProposal = (
  user: TeamUser,
  proposal: TeamProposal,
): boolean =>
  Boolean(user && proposal) &&
  (canOverseeProposal(user, proposal) ||
    (proposal.state === 'draft' &&
      Boolean(
        hasPermission(user, {
          permission: PermissionEnum.MANAGE_PROPOSAL,
          scopeId: proposal.uuid,
        }),
      )));

/**
 * Why a row the user may otherwise revoke cannot be removed: a proposal keeps
 * at least one proposal manager, whoever asks. `managerCount` is the number of
 * active proposal managers, undefined while unknown.
 */
export const getRemoveDisabledReason = (
  row: Pick<UserRoleDetails, 'role_name'>,
  managerCount: number | undefined,
): string | undefined =>
  row?.role_name === RoleEnum.PROPOSAL_MANAGER &&
  managerCount !== undefined &&
  managerCount <= 1
    ? translate(
        'A proposal must keep at least one proposal manager. Grant the role to someone else first.',
      )
    : undefined;
