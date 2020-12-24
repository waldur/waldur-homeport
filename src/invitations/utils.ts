import { AuthService } from '@waldur/auth/AuthService';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { createDeferred } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { router } from '@waldur/router';
import { showError, showSuccess } from '@waldur/store/notify';
import store from '@waldur/store/store';

import { InvitationService } from './InvitationService';

const InvitationConfirmDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "InvitationConfirmDialog" */ './InvitationConfirmDialog'
    ),
  'InvitationConfirmDialog',
);

export function checkAndAccept(token) {
  /*
     Call confirm token dialog, accept it and redirect user to profile.
     If user is not logged in - set token and redirect user to registration.
     If user is logged in and token is not valid - clear the token and redirect to user profile with the error message.
     */
  if (AuthService.isAuthenticated()) {
    return confirmInvitation(token)
      .then((replaceEmail) => {
        acceptInvitation(token, replaceEmail).then(() => {
          router.stateService.go('profile.details');
        });
      })
      .catch(() => {
        InvitationService.clearInvitationToken();
        store.dispatch(
          showError(translate('Invitation is not valid anymore.')),
        );
        router.stateService.go('profile.details');
      });
  } else {
    InvitationService.setInvitationToken(token);
    router.stateService.go('register');
  }
}

export function acceptInvitation(token, replaceEmail) {
  return InvitationService.accept(token, replaceEmail)
    .then(() => {
      store.dispatch(showSuccess(translate('Your invitation was accepted.')));
      InvitationService.clearInvitationToken();
      // TODO: Invalidate customers list
    })
    .catch((response) => {
      if (response.status === 404) {
        store.dispatch(showError(translate('Invitation is not found.')));
      } else if (response.status === 400) {
        InvitationService.clearInvitationToken();
        store.dispatch(showError(translate('Invitation is not valid.')));
      } else if (response.status === 500) {
        store.dispatch(
          showError(
            translate(
              'Internal server error occurred. Please try again or contact support.',
            ),
          ),
        );
      }
    });
}

export function confirmInvitation(token) {
  const deferred = createDeferred();
  store.dispatch(
    openModalDialog(InvitationConfirmDialog, {
      resolve: {
        token,
        deferred,
      },
    }),
  );
  return deferred.promise;
}
