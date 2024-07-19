import { AuthService } from '@waldur/auth/AuthService';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { createDeferred } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { router } from '@waldur/router';
import {
  showError,
  showRedirectMessage,
  showSuccess,
} from '@waldur/store/notify';
import store from '@waldur/store/store';
import { UsersService, getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';

import { InvitationService } from './InvitationService';
import { clearInvitationToken, setInvitationToken } from './InvitationStorage';

const InvitationConfirmDialog = lazyComponent(
  () => import('./InvitationConfirmDialog'),
  'InvitationConfirmDialog',
);

const GroupInvitationConfirmDialog = lazyComponent(
  () => import('./GroupInvitationConfirmDialog'),
  'GroupInvitationConfirmDialog',
);

export function checkAndAccept(token) {
  /*
     Call confirm token dialog, accept it and redirect user to profile.
     If user is not logged in - set token and redirect user to registration.
     If user is logged in and token is not valid - clear the token and redirect to user profile with the error message.
     */
  if (AuthService.isAuthenticated()) {
    return confirmInvitation(token)
      .then(({ replaceEmail, invitation }) => {
        acceptInvitation(token, replaceEmail).then(() => {
          // Refetch the user data to update the permissions for the new org or project
          UsersService.getCurrentUser(true).then(() => {
            if (invitation?.project_uuid) {
              router.stateService.go('project.dashboard', {
                uuid: invitation.project_uuid,
              });
            } else if (invitation?.customer_uuid) {
              router.stateService.go('organization.dashboard', {
                uuid: invitation.customer_uuid,
              });
            } else {
              router.stateService.go('profile.details');
            }
          });
        });
      })
      .catch(() => {
        clearInvitationToken();
        store.dispatch(
          showError(translate('Invitation is not valid anymore.')),
        );
        router.stateService.go('profile.details');
      });
  } else {
    setInvitationToken(token);
    router.stateService.go('login');
    store.dispatch(
      showRedirectMessage(
        translate('Authentication required.'),
        translate('To accept the invitation, please sign in to your account.'),
      ),
    );
  }
}

export function submitPermissionRequest(token) {
  return confirmUserGroupInvitation(token)
    .then((accept) => {
      if (accept) {
        submitGroupRequest(token).then(() => {
          router.stateService.go('profile.details');
        });
      }
    })
    .catch(() => {
      router.stateService.go('profile.details');
    });
}

export async function acceptInvitation(token, replaceEmail) {
  try {
    await InvitationService.accept(token, replaceEmail);
    store.dispatch(showSuccess(translate('Your invitation was accepted.')));
    clearInvitationToken();
    const newUser = await getCurrentUser();
    store.dispatch(setCurrentUser(newUser));
  } catch (error) {
    if (error.response?.status === 404) {
      store.dispatch(showError(translate('Invitation is not found.')));
    } else if (error.response?.status === 400) {
      clearInvitationToken();
      store.dispatch(showError(translate('Invitation is not valid.')));
    } else if (error.response?.status === 500) {
      store.dispatch(
        showError(
          translate(
            'Internal server error occurred. Please try again or contact support.',
          ),
        ),
      );
    }
  }
}

function submitGroupRequest(token) {
  return InvitationService.submitRequest(token)
    .then(() => {
      store.dispatch(
        showSuccess(translate('Your permission request has been submitted.')),
      );
    })
    .catch((error) => {
      if (error.response?.status === 404 || error.response?.status === 400) {
        store.dispatch(showError(translate('Request is not valid.')));
      } else if (error.response?.status === 500) {
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
      backdrop: 'static',
    }),
  );
  return deferred.promise;
}

function confirmUserGroupInvitation(token) {
  const deferred = createDeferred();
  store.dispatch(
    openModalDialog(GroupInvitationConfirmDialog, {
      resolve: {
        token,
        deferred,
      },
      backdrop: 'static',
    }),
  );
  return deferred.promise;
}
