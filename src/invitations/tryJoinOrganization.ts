import { GroupInvitationTokenStorage } from '@waldur/core/StorageManager';
import store from '@waldur/store/store';

import { UsersService } from '../user/UsersService';

import { requestToAccessOrganization } from './join-organization/submission';

/*
  Display join to organization dialog after login, if user has selected a group invitation.
*/
export function tryJoinOrganization() {
  UsersService.getCurrentUser().then((user) => {
    const token = GroupInvitationTokenStorage.get();

    if (token && user) {
      requestToAccessOrganization(token, store.dispatch);
    }
  });
}
