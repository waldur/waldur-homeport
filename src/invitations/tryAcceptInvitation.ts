import { InvitationTokenStorage } from '@/core/StorageManager';
import { NotifyService } from '@/store/notify';

import { translate } from '../i18n';
import { UsersService } from '../user/UsersService';

import { acceptInvitation, confirmInvitation } from './utils';

/*
  Display invitation confirm dialog on registration.

  Triggered only if user has registered, which is the case if:
  - $stateChangeSuccess called;
  - user is logged in;
  - invitation token is set in invitation service;
  - user has filled all mandatory fields;
*/
export function tryAcceptInvitation() {
  UsersService.getCurrentUser().then((user) => {
    const token = InvitationTokenStorage.get();
    if (token && !UsersService.mandatoryFieldsMissing(user)) {
      confirmInvitation(token)
        .then(() => {
          acceptInvitation(token);
        })
        .catch(() => {
          InvitationTokenStorage.remove();
          NotifyService.error(translate('Invitation could not be accepted'));
        });
    }
  });
}
