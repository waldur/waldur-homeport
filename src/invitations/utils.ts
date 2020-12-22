import { AuthService } from '@waldur/auth/AuthService';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { $q, $rootScope, $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import store from '@waldur/store/store';
import { UsersService } from '@waldur/user/UsersService';

import { InvitationService } from './InvitationService';

const InvitationConfirmDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "InvitationConfirmDialog" */ './InvitationConfirmDialog'
    ),
  'InvitationConfirmDialog',
);

export function init() {
  /*
     Display invitation confirm dialog on registration.

     Triggered only if user has registered, which is the case if:
     - $stateChangeSuccess called;
     - user is logged in;
     - invitation token is set in invitation service;
     - user has filled all mandatory fields;
     */
  $rootScope.$on('$stateChangeSuccess', (_, toState) => {
    if (
      AuthService.isAuthenticated() &&
      toState.name !== 'marketplace-public-offering.details'
    ) {
      UsersService.getCurrentUser().then((user) => {
        const token = InvitationService.getInvitationToken();
        if (token && !UsersService.mandatoryFieldsMissing(user)) {
          confirmInvitation(token)
            .then((replaceEmail) => {
              acceptInvitation(token, replaceEmail);
            })
            .catch(() => {
              InvitationService.clearInvitationToken();
              store.dispatch(
                showError(translate('Invitation could not be accepted')),
              );
            });
        }
      });
    }
  });
}

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
          $state.go('profile.details');
        });
      })
      .catch(() => {
        InvitationService.clearInvitationToken();
        store.dispatch(
          showError(translate('Invitation is not valid anymore.')),
        );
        $state.go('profile.details');
      });
  } else {
    InvitationService.setInvitationToken(token);
    $state.go('register');
  }
}

function acceptInvitation(token, replaceEmail) {
  return InvitationService.accept(token, replaceEmail)
    .then(() => {
      store.dispatch(showSuccess(translate('Your invitation was accepted.')));
      InvitationService.clearInvitationToken();
      $rootScope.$broadcast('refreshCustomerList', {
        updateSignal: true,
      });
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

function confirmInvitation(token) {
  const deferred = $q.defer();
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
