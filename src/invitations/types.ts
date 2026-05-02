import { Role, RoleType } from '@/permissions/types';
export { Invitation } from 'waldur-js-client';

export interface GenericInvitationContext {
  scope?: {
    manager_uuid?: string;
    url: string;
    uuid: string;
  };
  roleTypes?: RoleType[];
  /**
   * Filter ENV.roles down to these role names. Used by the org wizard when
   * the caller wants to offer a fixed subset of system roles.
   */
  roles?: string[];
  /**
   * Replace the wizard's role list entirely (skips ENV.roles + policy filter).
   * Used by scoped callers (resource / resource_project) that fetch their
   * available roles from a backend-filtered endpoint such as
   * `marketplaceOfferingRolesList`, where RoleAvailability is already enforced
   * server-side.
   */
  rolesOverride?: Role[];
  /**
   * Label for the dialog title when invoked outside org context (e.g. the
   * resource name). Falls back to a generic title if absent.
   */
  scopeLabel?: string;
}
