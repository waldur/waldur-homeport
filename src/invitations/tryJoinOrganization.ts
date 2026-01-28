import { GroupInvitationTokenStorage } from '@waldur/core/StorageManager';
import store from '@waldur/store/store';

import { UsersService } from '../user/UsersService';

import { requestToAccessOrganization } from './join-organization/submission';

/*
  Display join to organization dialog after login, if user has selected a group invitation.
  Only shows the dialog if the user has accepted ToS (has agreement_date).
  If ToS is not accepted yet, the dialog will be triggered later via useUpdateUser
  after the user accepts ToS on the profile page.
*/
export function tryJoinOrganization() {
  UsersService.getCurrentUser().then((user) => {
    const token = GroupInvitationTokenStorage.get();

    // Only show dialog if user has accepted ToS
    // Staff/support users are exempt from ToS requirement
    const hasAcceptedTos =
      user?.is_staff || user?.is_support || Boolean(user?.agreement_date);

    if (token && user && hasAcceptedTos) {
      requestToAccessOrganization(token, store.dispatch);
    }
  });
}
