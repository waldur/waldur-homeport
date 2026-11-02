import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { RoleEnum } from '@/permissions/enums';

interface ScopeRow {
  scope_type?: string | null;
  scope_uuid?: string | null;
  role_name?: string | null;
  customer_uuid?: string | null;
  resource_uuid?: string | null;
}

interface ScopeLink {
  state: string;
  params: Record<string, string>;
}

/**
 * Where the scope name of a role row should take the user, or null when there
 * is no page this role can be sure to open.
 *
 * A link is only offered where the role itself passes the destination's guard:
 * a link that lands on "Restricted page" or a 404 is worse than plain text.
 */
export const getScopeLink = (row: ScopeRow): ScopeLink | null => {
  const { scope_type, scope_uuid, role_name, customer_uuid } = row;
  if (!scope_uuid) {
    return null;
  }
  switch (scope_type) {
    case 'project':
      return { state: 'project.dashboard', params: { uuid: scope_uuid } };

    case 'resource':
      return {
        state: 'marketplace-resource-details',
        params: { resource_uuid: scope_uuid },
      };

    case 'resource_project':
      // ResourceProjects don't have a standalone page; deep-link to the parent
      // resource's Resource projects tab so the user can expand the row.
      return row.resource_uuid
        ? {
            state: 'marketplace-resource-details',
            params: {
              resource_uuid: row.resource_uuid,
              tab: 'resource-projects',
            },
          }
        : null;

    case 'proposal':
      // No role gate: the proposal role *is* the grant. The backend answers a
      // proposal retrieve for anyone holding PROPOSAL.MANAGER or
      // PROPOSAL.MEMBER on it, so any row in this table can open its scope.
      return {
        state: 'proposals.manage-proposal',
        params: { proposal_uuid: scope_uuid },
      };

    case 'call':
      // Only the call manager can open the call management dashboard
      // (mirrors checkIsCallManager / the CallTabs "Manage" gate).
      if (role_name === RoleEnum.CALL_MANAGER) {
        return {
          state: 'protected-call.manage',
          params: { call_uuid: scope_uuid },
        };
      }
      // A reviewer's work on a call lives in their reviewer pages. The public
      // call page is not used: it serves only active and archived calls, and
      // a reviewer or panel member can already hold a role on a draft call,
      // whose state this row does not carry.
      if (role_name === RoleEnum.CALL_REVIEWER) {
        return { state: 'reviews-calls', params: {} };
      }
      return null;

    case 'call_organizer':
      // The role is held on the organisation's call-managing body, so it opens
      // that organisation's call management.
      return customer_uuid &&
        isFeatureVisible(MarketplaceFeatures.show_call_management_functionality)
        ? {
            state: 'call-management.dashboard',
            params: { uuid: customer_uuid },
          }
        : null;

    case 'offering':
      // The provider offering page is guarded on OFFERING.UPDATE, which the
      // system offering manager role carries; a custom offering role may not.
      return role_name === RoleEnum.OFFERING_MANAGER && customer_uuid
        ? {
            state: 'marketplace-offering-details',
            params: { uuid: customer_uuid, offering_uuid: scope_uuid },
          }
        : null;

    default:
      return null;
  }
};
