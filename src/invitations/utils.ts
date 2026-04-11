import {
  userGroupInvitationsRetrieve,
  userGroupInvitationsSubmitRequest,
  userInvitationsAccept,
} from 'waldur-js-client';

import * as AuthService from '@waldur/auth/AuthService';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { lazyComponent } from '@waldur/core/lazyComponent';
import {
  GroupInvitationTokenStorage,
  InvitationTokenStorage,
} from '@waldur/core/StorageManager';
import { createDeferred } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { router } from '@waldur/router';
import {
  showError,
  showRedirectMessage,
  showSuccess,
} from '@waldur/store/notify';
import store from '@waldur/store/store';
import { UsersService, getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';

// Backend error messages mapped to translated frontend strings
const BACKEND_ERROR_TRANSLATIONS: Record<string, string> = {
  'You are not allowed to accept this invitation. Your email or organization must match the invitation restrictions.':
    translate(
      'You are not allowed to accept this invitation. Your email or organization must match the invitation restrictions.',
    ),
  'User already has this role in the scope.': translate(
    'User already has this role in the scope.',
  ),
  'User already has role within this scope.': translate(
    'User already has role within this scope.',
  ),
  'Permission request already exists for this scope.': translate(
    'Permission request already exists for this scope.',
  ),
};

const translateBackendError = (message: string): string =>
  BACKEND_ERROR_TRANSLATIONS[message] || message;

const isDuplicateOrConflictError = (errorMessage: unknown): boolean =>
  typeof errorMessage === 'string' &&
  (errorMessage.includes('already exists') ||
    errorMessage.includes('already has'));

const InvitationConfirmDialog = lazyComponent(() =>
  import('./InvitationConfirmDialog').then((module) => ({
    default: module.InvitationConfirmDialog,
  })),
);

const GroupInvitationConfirmDialog = lazyComponent(() =>
  import('./GroupInvitationConfirmDialog').then((module) => ({
    default: module.GroupInvitationConfirmDialog,
  })),
);

const ProjectDetailsDialog = lazyComponent(() =>
  import('./join-organization/ProjectDetailsDialog').then((module) => ({
    default: module.ProjectDetailsDialog,
  })),
);

export function getGroupInvitationLink(invitation) {
  return `${location.origin}/user-group-invitation/${invitation.uuid}/`;
}

export function checkAndAccept(token) {
  /*
     Call confirm token dialog, accept it and redirect user to profile.
     If user is not logged in - set token and redirect user to registration.
     If user is logged in and token is not valid - clear the token and redirect to user profile with the error message.
     */
  if (AuthService.isAuthenticated()) {
    return confirmInvitation(token)
      .then(({ invitation }) => {
        acceptInvitation(token).then(() => {
          // Refetch the user data to update the permissions for the new org or project
          UsersService.refreshCurrentUser().then(() => {
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
        InvitationTokenStorage.remove();
        store.dispatch(
          showError(translate('Invitation is not valid anymore.')),
        );
        router.stateService.go('profile.details');
      });
  } else {
    InvitationTokenStorage.set(token);
    router.stateService.go('login');
    store.dispatch(
      showRedirectMessage(
        translate('Authentication required.'),
        translate('To accept the invitation, please sign in to your account.'),
      ),
    );
  }
}

function collectProjectDetails(token): Promise<{
  project_name?: string;
  project_description?: string;
} | null> {
  return userGroupInvitationsRetrieve({ path: { uuid: token } }).then((res) => {
    const invitation = res.data;
    if (!invitation.allow_custom_project_details) return null;
    return new Promise((resolve) => {
      store.dispatch(
        openModalDialog(ProjectDetailsDialog, {
          resolve: {
            onSubmit: (data) => resolve(data),
            onCancel: () => resolve(null),
          },
          size: 'md',
        }),
      );
    });
  });
}

export function submitPermissionRequest(token) {
  return confirmUserGroupInvitation(token)
    .then(async (accept) => {
      if (accept) {
        const projectDetails = await collectProjectDetails(token);
        submitGroupRequest(token, projectDetails || undefined)
          .then(() => {
            router.stateService.go('profile.details');
          })
          .catch(async (error) => {
            const errorMessage = format(error);
            if (isDuplicateOrConflictError(errorMessage)) {
              try {
                await waitForConfirmation(
                  store.dispatch,
                  translate('You already have access'),
                  translate(
                    'You already have the requested role or a pending request for this organization.',
                  ),
                  {
                    type: 'primary',
                    size: 'sm',
                    positiveButton: translate('OK'),
                    positiveButtonVariant: 'primary w-95px',
                    onlyPositiveButton: true,
                  },
                );
              } finally {
                router.stateService.go('profile.details');
              }
            } else {
              try {
                await waitForConfirmation(
                  store.dispatch,
                  translate('Access restricted'),
                  translateBackendError(errorMessage) ||
                    translate(
                      "You don't have the required permissions to join this organization.",
                    ),
                  {
                    type: 'danger',
                    size: 'sm',
                    positiveButton: translate('My requests'),
                    positiveButtonVariant: 'primary w-175px',
                    onlyPositiveButton: true,
                  },
                );
              } finally {
                router.stateService.go('profile.permission-requests');
              }
            }
          });
      } else {
        // User cancelled - clear token and redirect to profile
        GroupInvitationTokenStorage.remove();
        router.stateService.go('profile.details');
      }
    })
    .catch(() => {
      // Dialog dismissed or error - clear token and redirect to profile
      GroupInvitationTokenStorage.remove();
      router.stateService.go('profile.details');
    });
}

export async function acceptInvitation(token) {
  try {
    await userInvitationsAccept({ path: { uuid: token } });
    store.dispatch(showSuccess(translate('Your invitation was accepted.')));
    InvitationTokenStorage.remove();
    const newUser = await getCurrentUser();
    store.dispatch(setCurrentUser(newUser));
  } catch (error) {
    if (error.response?.status === 404) {
      store.dispatch(showError(translate('Invitation is not found.')));
    } else if (error.response?.status === 400) {
      InvitationTokenStorage.remove();
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

function submitGroupRequest(
  token,
  body?: { project_name?: string; project_description?: string },
) {
  return userGroupInvitationsSubmitRequest({
    path: { uuid: token },
    body: body || {},
  })
    .then(async (res) => {
      if (res.data.auto_approved) {
        // Refresh user to get updated permissions from backend
        await UsersService.refreshCurrentUser();
        store.dispatch(
          showSuccess(
            translate('You have successfully joined {organization}', {
              organization: res.data.scope_name,
            }),
          ),
        );
      } else {
        store.dispatch(
          showSuccess(
            translate(
              'Request has been sent. You’ll be notified once it’s approved.',
            ),
            translate('You are requested to join {organization}', {
              organization: res.data.scope_name,
            }),
          ),
        );
      }
      return res.data;
    })
    .catch((error) => {
      if (error.response?.status === 500) {
        store.dispatch(
          showError(
            translate(
              'Internal server error occurred. Please try again or contact support.',
            ),
          ),
        );
      }
      throw error;
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
