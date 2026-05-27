import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { useCallback } from 'react';
import { userInvitationsAccept } from 'waldur-js-client';

import * as AuthService from '@/auth/AuthService';
import { InvitationTokenStorage } from '@/core/StorageManager';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { UsersService, getCurrentUser } from '@/user/UsersService';
import { useSetUser } from '@/workspace/hooks';

import { InvitationConfirmDialog } from './InvitationConfirmDialog';

export function useCheckAndAccept(token: string) {
  const router = useRouter();
  const { openDialog } = useModal();
  const { showSuccess, showError } = useNotify();
  const setCurrentUser = useSetUser();

  const acceptMutation = useMutation({
    mutationFn: () => userInvitationsAccept({ path: { uuid: token } }),
    onSuccess: async () => {
      showSuccess(translate('Your invitation was accepted.'));
      InvitationTokenStorage.remove();
      const newUser = await getCurrentUser();
      setCurrentUser(newUser);
    },
    onError: (error: any) => {
      if (error.response?.status === 404) {
        showError(translate('Invitation is not found.'));
      } else if (error.response?.status === 400) {
        InvitationTokenStorage.remove();
        if (error.response?.data?.detail) {
          showError(error.response.data.detail);
        } else {
          showError(translate('Invitation is not valid.'));
        }
      } else if (error.response?.status === 500) {
        showError(
          translate(
            'Internal server error occurred. Please try again or contact support.',
          ),
        );
      } else if (error.response?.data?.detail) {
        showError(error.response.data.detail);
      } else {
        showError(translate('Unable to accept invitation.'));
      }
      router.stateService.go('profile.details');
    },
  });

  const checkAndAccept = useCallback(() => {
    if (AuthService.isAuthenticated()) {
      UsersService.getCurrentUser().then((user) => {
        if (UsersService.mandatoryFieldsMissing(user)) {
          InvitationTokenStorage.set(token);
          router.stateService.go('profile.details');
          showError(
            translate(
              'Please complete your profile before accepting the invitation.',
            ),
          );
          return;
        }
        openDialog(InvitationConfirmDialog, {
          resolve: {
            token,
            onConfirm: ({ invitation }) => {
              acceptMutation.mutate(undefined, {
                onSuccess: () => {
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
                },
              });
            },
            onCancel: () => {
              InvitationTokenStorage.remove();
              showError(translate('Invitation is not valid anymore.'));
              router.stateService.go('profile.details');
            },
          },
          backdrop: 'static',
        });
      });
    } else {
      InvitationTokenStorage.set(token);
      router.stateService.go('login');
      showError(
        translate('To accept the invitation, please sign in to your account.'),
      );
    }
  }, [token, openDialog, acceptMutation, router, showError]);

  return { checkAndAccept, isPending: acceptMutation.isPending };
}
