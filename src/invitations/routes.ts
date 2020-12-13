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

export const states: StateDeclaration[] = [
  {
    name: 'invitation',
    url: '/invitation/:uuid/',
    data: {
      bodyClass: 'old',
    },
    component: InvitationAccept,
  },

  {
    name: 'invitation-approve',
    url: '/invitation_approve/:token/',
    component: InvitationApprove,
    data: {
      bodyClass: 'old',
    },
  },

  {
    name: 'invitation-reject',
    url: '/invitation_reject/:token/',
    component: InvitationReject,
    data: {
      bodyClass: 'old',
    },
  },
];
