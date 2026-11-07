import { User } from 'waldur-js-client';

import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';

interface InvitationScope {
  scope_type?: string | null;
  scope_uuid?: string | null;
  customer_uuid?: string | null;
}

interface LandingState {
  state: string;
  params?: Record<string, string>;
}

const PROFILE: LandingState = { state: 'profile.details' };

/**
 * Where to send a user who has just accepted an invitation. The page must be
 * one the new role can open: an offering manager or a proposal member holds
 * no role on the organization, so its dashboard would answer with a 404.
 */
export const getInvitationLandingState = (
  invitation: InvitationScope | undefined,
  user: Pick<User, 'is_staff' | 'permissions'> | undefined,
): LandingState => {
  const scopeUuid = invitation?.scope_uuid;
  if (!scopeUuid) {
    return PROFILE;
  }
  switch (invitation.scope_type) {
    case 'customer':
      return { state: 'organization.dashboard', params: { uuid: scopeUuid } };
    case 'project':
      return { state: 'project.dashboard', params: { uuid: scopeUuid } };
    case 'call':
      // Panel members and reviewers can read the call but not manage it.
      return hasPermission(user, {
        permission: PermissionEnum.UPDATE_CALL,
        scopeId: scopeUuid,
      })
        ? { state: 'protected-call.manage', params: { call_uuid: scopeUuid } }
        : { state: 'public-call.details', params: { call_uuid: scopeUuid } };
    case 'proposal':
      return {
        state: 'proposals.manage-proposal',
        params: { proposal_uuid: scopeUuid },
      };
    case 'offering':
      if (
        invitation.customer_uuid &&
        hasPermission(user, {
          permission: PermissionEnum.UPDATE_OFFERING,
          customerId: invitation.customer_uuid,
          offeringId: scopeUuid,
        })
      ) {
        return {
          state: 'marketplace-offering-details',
          params: {
            uuid: invitation.customer_uuid,
            offering_uuid: scopeUuid,
          },
        };
      }
      return PROFILE;
    default:
      return PROFILE;
  }
};
