import store from '@waldur/store/store';

import { UsersService } from '../user/UsersService';

import { getGroupInvitationToken } from './InvitationStorage';
import { requestToAccessOrganization } from './join-organization/submission';

/*
  Display join to organization dialog after login, if user has selected a group invitation.
*/
export function tryJoinOrganization() {
  UsersService.getCurrentUser().then((user) => {
    const token = getGroupInvitationToken();

    if (token && user) {
      requestToAccessOrganization(token, store.dispatch);
    }
  });
}
