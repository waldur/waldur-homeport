import { StateDeclaration } from '@waldur/core/types';

import { InvitationAccept } from './InvitationAccept';
import { InvitationApprove } from './InvitationApprove';
import { InvitationReject } from './InvitationReject';

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
