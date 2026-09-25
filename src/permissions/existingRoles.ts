import { InvitationExistingRole, UserRoleDetails } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';

/**
 * A role the person already holds in the scope we are about to grant a role in.
 * `roleUuid` is the role being requested, `existingRole*` the one already held.
 */
export interface ExistingRoleHit {
  email?: string;
  roleUuid: string;
  /** The project the role was checked in, when the requested role is project-scoped. */
  projectUuid?: string;
  existingRoleUuid: string;
  existingRoleName: string;
  isSameRole: boolean;
}

export interface ExistingRoleFeedback {
  blocking: boolean;
  message: string;
}

/**
 * The invitation duplicate check resolves invitees by email, so its entries
 * already carry a display label; unlike list_users it needs no local lookup.
 */
export const mapExistingRoleResponse = (
  items: InvitationExistingRole[] | undefined,
): ExistingRoleHit[] =>
  (items ?? []).map((item) => ({
    email: item.email,
    roleUuid: item.role,
    existingRoleUuid: item.existing_role,
    existingRoleName: item.existing_role_description || item.existing_role_name,
    isSameRole: item.is_same_role,
  }));

export const isMultipleRolesPerScopeDisabled = (): boolean =>
  Boolean(ENV.plugins.WALDUR_CORE?.INVITATION_DISABLE_MULTIPLE_ROLES);

/**
 * list_users reports the role's enum name (PROJECT.ADMIN, or PROJECT.acme.ADMIN
 * for an organization clone), which is not what a person should be shown, so
 * resolve the deployment's description the way the role picker does.
 */
const getRoleLabel = (roleUuid: string, roleName: string): string => {
  const role = ENV.roles?.find((item) => item.uuid === roleUuid);
  return role?.description || roleName;
};

export const mapUserRoleDetails = (
  permissions: UserRoleDetails[] | undefined,
  requestedRoleUuid: string,
): ExistingRoleHit[] =>
  (permissions ?? []).map((permission) => ({
    email: permission.user_email,
    roleUuid: requestedRoleUuid,
    existingRoleUuid: permission.role_uuid,
    existingRoleName: getRoleLabel(permission.role_uuid, permission.role_name),
    isSameRole: permission.role_uuid === requestedRoleUuid,
  }));

/**
 * Severity mirrors the two backend guards, only one of which is flag-gated:
 * the same role is rejected by validate_role_grant unconditionally, while a
 * different role in the same scope is rejected only when
 * INVITATION_DISABLE_MULTIPLE_ROLES is on. Everything else is legitimate
 * multi-role usage and must not block the form.
 */
export const getExistingRoleMessage = (hit: ExistingRoleHit): string => {
  if (hit.isSameRole) {
    return translate(
      'User already has this role in this scope. Update their existing role instead.',
    );
  }
  const role = hit.existingRoleName;
  if (isMultipleRolesPerScopeDisabled()) {
    return translate(
      'User already has the "{role}" role in this scope. Only one role per scope is allowed.',
      { role },
    );
  }
  return translate('User already has the "{role}" role in this scope.', {
    role,
  });
};

export const isExistingRoleBlocking = (hit: ExistingRoleHit): boolean =>
  hit.isSameRole || isMultipleRolesPerScopeDisabled();

/**
 * Identifies a set of warnings so the caller can tell a set it has already put
 * on screen from a new one. Sorted, because the duplicate check queries each
 * scope in parallel and collects the answers in whatever order they arrive.
 */
export const getWarningSignature = (hits: ExistingRoleHit[]): string =>
  hits
    .map(
      (hit) =>
        `${hit.email}\0${hit.roleUuid}\0${hit.projectUuid ?? ''}\0${hit.existingRoleUuid}`,
    )
    .sort()
    .join('|');

/**
 * Whether the invitation dialog should stay on the row list instead of
 * advancing. Warnings are rendered next to the rows, so advancing immediately
 * would unmount them and the inviter would never see what they were told.
 * Acknowledging means they have been shown once; the next Continue proceeds.
 */
export const shouldHoldForWarnings = (
  warningHits: ExistingRoleHit[],
  acknowledgedSignature: string,
): boolean =>
  warningHits.length > 0 &&
  getWarningSignature(warningHits) !== acknowledgedSignature;

export const getExistingRoleFeedback = (
  hits: ExistingRoleHit[],
): ExistingRoleFeedback | null => {
  // The same role is the louder of the two, so it wins when both are present.
  const hit = hits.find((item) => item.isSameRole) ?? hits[0];
  if (!hit) {
    return null;
  }
  return {
    blocking: isExistingRoleBlocking(hit),
    message: getExistingRoleMessage(hit),
  };
};
