import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const InvitationAccept = lazyComponent(
  () => import(/* webpackChunkName: "InvitationAccept" */ './InvitationAccept'),
  'InvitationAccept',
);
const InvitationApprove = lazyComponent(
  () =>
    import(/* webpackChunkName: "InvitationApprove" */ './InvitationApprove'),
  'InvitationApprove',
);
const InvitationReject = lazyComponent(
  () => import(/* webpackChunkName: "InvitationReject" */ './InvitationReject'),
  'InvitationReject',
);
const UserGroupInvitation = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "UserGroupInvitation" */ './UserGroupInvitation'
    ),
  'UserGroupInvitation',
);

export const states: StateDeclaration[] = [
  {
    name: 'invitation-accept',
    url: '/invitation/:uuid/',
    component: InvitationAccept,
  },

  {
    name: 'invitation-approve',
    url: '/invitation_approve/:token/',
    component: InvitationApprove,
  },

  {
    name: 'invitation-reject',
    url: '/invitation_reject/:token/',
    component: InvitationReject,
  },

  {
    name: 'user-group-invitation',
    url: '/user-group-invitation/:token/',
    component: UserGroupInvitation,
    data: {
      auth: true,
    },
  },
];
