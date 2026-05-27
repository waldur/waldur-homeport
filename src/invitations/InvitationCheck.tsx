import { useMutation } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useEffect, useRef } from 'react';
import { userInvitationsAccept } from 'waldur-js-client';

import * as AuthService from '@/auth/AuthService';
import { InvitationTokenStorage } from '@/core/StorageManager';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { getCurrentUser, UsersService } from '@/user/UsersService';
import { useSetUser } from '@/workspace/hooks';

import { InvitationConfirmDialog } from './InvitationConfirmDialog';
import { useRequestToAccessOrganization } from './join-organization/submission';

/**
 * React component that handles post-login invitation acceptance and
 * organization join flows. Replaces the transition handler that was
 * previously in transitions.ts.
 *
 * Mount this at the app root (e.g. in Layout.tsx) so it reacts to
 * every successful route change.
 */

export const useInvitationCheck = () => {
  const { state } = useCurrentStateAndParams();
  const router = useRouter();
  const { openDialog } = useModal();
  const { showSuccess, showError } = useNotify();
  const setCurrentUser = useSetUser();
  const isInitialLoad = useRef(true);
  const { checkAndRequest } = useRequestToAccessOrganization();

  const acceptMutation = useMutation({
    mutationFn: (token: string) =>
      userInvitationsAccept({ path: { uuid: token } }),
    onSuccess: async () => {
      showSuccess(translate('Your invitation was accepted.'));
      InvitationTokenStorage.remove();
      const newUser = await getCurrentUser();
      setCurrentUser(newUser);
    },
    onError: () => {
      InvitationTokenStorage.remove();
      showError(translate('Invitation could not be accepted'));
    },
  });

  useEffect(() => {
    if (!state?.name) return;
    if (!AuthService.isAuthenticated()) return;
    if (state.data?.skipAuth) return;

    const currentPath = router.urlService.path();
    const isGroupInvitationRoute =
      currentPath?.split('/')[1] === 'user-group-invitations';

    // Try to accept a pending regular invitation
    // Skip on the group invitation route (it has its own flow)
    if (!isGroupInvitationRoute) {
      UsersService.getCurrentUser().then((user) => {
        const token = InvitationTokenStorage.get();
        if (token && !UsersService.mandatoryFieldsMissing(user)) {
          openDialog(InvitationConfirmDialog, {
            resolve: {
              token,
              onConfirm: () => {
                acceptMutation.mutate(token);
              },
              onCancel: () => {
                InvitationTokenStorage.remove();
                showError(translate('Invitation could not be accepted'));
              },
            },
            backdrop: 'static',
          });
        }
      });
    }

    // On initial page load, check for pending group invitation token
    // Skip if landing on user-group-invitation route (it handles its own flow)
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      if (state.name !== 'user-group-invitation') {
        checkAndRequest();
      }
    }
  }, [state?.name]);
};

export const InvitationCheck: FC = () => {
  useInvitationCheck();
  return null;
};
