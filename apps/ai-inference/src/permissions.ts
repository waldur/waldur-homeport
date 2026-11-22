import { translate } from 'waldur-i18n-runtime';
import { MePermission, Project, ResourceApiKeyStatus } from 'waldur-js-client';

/**
 * Client-side mirrors of the backend's gates on keys, so nobody is offered a
 * button the backend would refuse. Which roles carry a permission is each
 * deployment's choice, so it is read from /api/roles/.
 */
export const MANAGE_KEYS = 'RESOURCE.MANAGE_CONSUMER_API_KEY';
export const REVEAL_SHARED_KEYS = 'RESOURCE.REVEAL_API_KEY';

export interface Grants {
  userUuid: string;
  isStaff: boolean;
  /** /users/me/'s active roles. */
  permissions: Pick<
    MePermission,
    'scope_type' | 'scope_uuid' | 'role_name' | 'expiration_time'
  >[];
  /** Role name → the permissions it carries. */
  roles: Map<string, Set<string>>;
}

type Scope = Pick<Project, 'uuid' | 'customer_uuid'>;

const isCurrent = (permission: Grants['permissions'][number], now: number) =>
  !permission.expiration_time ||
  new Date(permission.expiration_time).getTime() > now;

/** Whether a role on the project or its organisation carries `permission`. */
const holds = (
  grants: Grants | undefined,
  permission: string,
  scope: Scope,
  now = Date.now(),
) =>
  Boolean(
    grants?.permissions.some(
      (grant) =>
        isCurrent(grant, now) &&
        ((grant.scope_type === 'project' && grant.scope_uuid === scope.uuid) ||
          (grant.scope_type === 'customer' &&
            grant.scope_uuid === scope.customer_uuid)) &&
        grants.roles.get(grant.role_name)?.has(permission),
    ),
  );

/** Issuing keys and changing their models and limits. Staff may too. */
export const canManageKeys = (grants: Grants | undefined, scope: Scope) =>
  Boolean(grants?.isStaff) || holds(grants, MANAGE_KEYS, scope);

/** Whether the user is in the project or its organisation at all. */
const isMember = (grants: Grants | undefined, scope: Scope) =>
  Boolean(
    grants?.permissions.some(
      (grant) =>
        (grant.scope_type === 'project' && grant.scope_uuid === scope.uuid) ||
        (grant.scope_type === 'customer' &&
          grant.scope_uuid === scope.customer_uuid),
    ),
  );

/**
 * Why the user cannot reveal a key, or undefined when they can. The same
 * rules as the backend, which holds staff to them too: an assigned key only
 * to its assignee; a shared one to whoever's role carries the permission.
 */
export const revealBlockedReason = (
  key: Pick<ResourceApiKeyStatus, 'state' | 'user_uuid'>,
  grants: Grants | undefined,
  scope: Scope,
): string | undefined => {
  if (key.state !== 'OK') {
    return translate('A key can be revealed once it is active.');
  }
  if (!isMember(grants, scope)) {
    return translate(
      'Only members of the project or its organisation can reveal its keys.',
    );
  }
  if (key.user_uuid) {
    return key.user_uuid === grants?.userUuid
      ? undefined
      : translate('Only the person it is assigned to can reveal this key.');
  }
  return holds(grants, REVEAL_SHARED_KEYS, scope)
    ? undefined
    : translate('Your role here does not allow revealing shared keys.');
};

/** Replacing a key's value: its assignee, or whoever manages keys. */
export const canRotate = (
  key: Pick<ResourceApiKeyStatus, 'state' | 'user_uuid'>,
  grants: Grants | undefined,
  scope: Scope,
) =>
  key.state === 'OK' &&
  ((!!key.user_uuid && key.user_uuid === grants?.userUuid) ||
    canManageKeys(grants, scope));

/** Approving an order as the consumer: a project's own requests. */
const APPROVE_ORDERS = 'ORDER.APPROVE';

const APPROVER_LABELS: Record<string, () => string> = {
  'PROJECT.MANAGER': () => translate('project managers'),
  'PROJECT.ADMIN': () => translate('project administrators'),
  'CUSTOMER.OWNER': () => translate('organisation owners'),
};

/**
 * Who approves a project's requests here, for people: "Organisation
 * owners", "Project managers and organisation owners". Read from the
 * roles' permissions, since each deployment sets them. Undefined when no
 * role the app can name carries the permission.
 */
export const approverRolesText = (grants: Grants | undefined) => {
  const labels = Object.keys(APPROVER_LABELS)
    .filter((role) => grants?.roles.get(role)?.has(APPROVE_ORDERS))
    .map((role) => APPROVER_LABELS[role]());
  if (!labels.length) return undefined;
  const text =
    labels.length === 1
      ? labels[0]
      : translate('{first} and {last}', {
          first: labels.slice(0, -1).join(', '),
          last: labels[labels.length - 1],
        });
  return text.charAt(0).toUpperCase() + text.slice(1);
};
