import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { ANONYMOUS_LAYOUT_ROUTE_CONFIG } from '@waldur/marketplace/constants';
import { hasNonProjectPermissions } from '@waldur/workspace/selectors';

const canAccessOrganization = (state) => {
  const hideFromProjectMembers = isFeatureVisible(
    MarketplaceFeatures.hide_organization_information_from_project_members,
  );
  if (!hideFromProjectMembers) {
    return true;
  }
  return hasNonProjectPermissions(state);
};

export const states: StateDeclaration[] = [
  {
    name: 'invitation-accept',
    url: '/invitation/:uuid/',
    component: lazyComponent(() =>
      import('./InvitationAccept').then((module) => ({
        default: module.InvitationAccept,
      })),
    ),
  },

  {
    name: 'invitation-approve',
    url: '/invitation_approve/:token/',
    component: lazyComponent(() =>
      import('./InvitationApprove').then((module) => ({
        default: module.InvitationApprove,
      })),
    ),
  },

  {
    name: 'invitation-reject',
    url: '/invitation_reject/:token/',
    component: lazyComponent(() =>
      import('./InvitationReject').then((module) => ({
        default: module.InvitationReject,
      })),
    ),
  },

  {
    name: 'user-group-invitation',
    url: '/user-group-invitation/:token/',
    component: lazyComponent(() =>
      import('./UserGroupInvitation').then((module) => ({
        default: module.UserGroupInvitation,
      })),
    ),
    data: {
      auth: true,
    },
  },

  {
    name: 'public.join-organization',
    url: '/join-organization/',
    component: lazyComponent(() =>
      import('./join-organization/AvailableOrganizationsToJoin').then(
        (module) => ({
          default: module.AvailableOrganizationsToJoin,
        }),
      ),
    ),
    data: {
      skipBreadcrumb: true,
      permissions: [canAccessOrganization],
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
];
