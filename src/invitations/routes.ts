import { StateDeclaration } from '@waldur/core/types';
import { withStore } from '@waldur/store/connect';

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
    component: withStore(InvitationAccept),
  },

  {
    name: 'invitation-approve',
    url: '/invitation_approve/:token/',
    component: withStore(InvitationApprove),
    data: {
      bodyClass: 'old',
    },
  },

  {
    name: 'invitation-reject',
    url: '/invitation_reject/:token/',
    component: withStore(InvitationReject),
    data: {
      bodyClass: 'old',
    },
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
