import { RoleEnum } from '@/permissions/enums';

const CALL_ROLES: string[] = [
  RoleEnum.CALL_MANAGER,
  RoleEnum.CALL_REVIEWER,
  RoleEnum.CALL_PANEL_MEMBER,
];

/**
 * Whoever runs or works on calls: staff and support, a call's managers,
 * reviewers and panel members, and the organisers of a call-managing
 * organisation. In marketplace-only mode they keep the call catalogue the
 * deployment's applicants do not see.
 */
export const isCallsOperator = (user): boolean =>
  Boolean(user?.is_staff) ||
  Boolean(user?.is_support) ||
  Boolean(
    user?.permissions?.some(
      (permission) =>
        permission.scope_type === 'call_organizer' ||
        (permission.scope_type === 'call' &&
          CALL_ROLES.includes(permission.role_name)),
    ),
  );

/**
 * Whoever reads across calls: staff, support, the organisers of a
 * call-managing organisation and the managers of a call. The "All proposals"
 * and "All reviews" pages are theirs; everyone else's own work is under My
 * proposals and My tasks.
 */
export const canReadAllCallWork = (user): boolean =>
  Boolean(user?.is_staff) ||
  Boolean(user?.is_support) ||
  Boolean(
    user?.permissions?.some(
      (permission) =>
        permission.scope_type === 'call_organizer' ||
        (permission.scope_type === 'call' &&
          permission.role_name === RoleEnum.CALL_MANAGER),
    ),
  );

/**
 * Who works the call-management pages of the organisation `customerUuid`:
 * staff and support, its owners, its call organisers, and the managers of its
 * calls -- the same people the call pages admit (canAccessCallManagement).
 * Reviewers, panel members and the organisation's project members are not.
 */
export const canManageCallsOf = (user, customerUuid: string): boolean =>
  Boolean(user?.is_staff) ||
  Boolean(user?.is_support) ||
  Boolean(
    user?.permissions?.some(
      (permission) =>
        permission.customer_uuid === customerUuid &&
        ((permission.scope_type === 'customer' &&
          permission.role_name === RoleEnum.CUSTOMER_OWNER) ||
          permission.scope_type === 'call_organizer' ||
          (permission.scope_type === 'call' &&
            permission.role_name === RoleEnum.CALL_MANAGER)),
    ),
  );

/**
 * Who may read the reports on the organisation `customerUuid`'s calls: staff
 * and support, its call organisers, and the managers of its calls -- the
 * roles carrying CALL.UPDATE, which the report endpoint asks for. Narrower
 * than `canManageCallsOf`: an owner of the organisation holds no CALL.UPDATE,
 * and the endpoint refuses one who has no call role besides.
 */
export const canReadCallReportsOf = (user, customerUuid: string): boolean =>
  Boolean(user?.is_staff) ||
  Boolean(user?.is_support) ||
  Boolean(
    user?.permissions?.some(
      (permission) =>
        permission.customer_uuid === customerUuid &&
        (permission.scope_type === 'call_organizer' ||
          (permission.scope_type === 'call' &&
            permission.role_name === RoleEnum.CALL_MANAGER)),
    ),
  );
