import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { useCallback } from 'react';
import {
  userGroupInvitationsRetrieve,
  userGroupInvitationsSubmitRequest,
} from 'waldur-js-client';

import { format } from '@/core/ErrorMessageFormatter';
import { GroupInvitationTokenStorage } from '@/core/StorageManager';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { UsersService } from '@/user/UsersService';
import { useUser } from '@/workspace/hooks';

import { GroupInvitationConfirmDialog } from './GroupInvitationConfirmDialog';
import { ProjectDetailsDialog } from './join-organization/ProjectDetailsDialog';
import {
  getDuplicateErrorDialogOptions,
  getPostJoinDestination,
  isDuplicateOrConflictError,
} from './utils';

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

type ProjectDetailsResult = {
  cancelled: boolean;
  details?: { project_name?: string; project_description?: string };
};

function resolveProjectNameTemplate(
  template: string,
  user: { username?: string; email?: string; full_name?: string },
): string {
  if (!user || !template) return '';
  return template
    .replace(/\{username\}/g, user.username || '')
    .replace(/\{email\}/g, user.email || '')
    .replace(/\{full_name\}/g, user.full_name || user.username || '');
}

export function useSubmitPermissionRequest(token: string) {
  const routerInstance = useRouter();
  const { openDialog, confirm } = useModal();
  const { showSuccess, showError } = useNotify();
  const user = useUser();

  const submitMutation = useMutation({
    mutationFn: (body?: {
      project_name?: string;
      project_description?: string;
    }) =>
      userGroupInvitationsSubmitRequest({
        path: { uuid: token },
        body: body || {},
      }),
    onSuccess: async (res) => {
      // The token was written to storage when this route was visited; clear it
      // now, or the app-root InvitationCheck re-triggers the whole flow from
      // storage after we navigate away.
      GroupInvitationTokenStorage.remove();
      const { auto_approved, scope_name, project_uuid, project_created } =
        res.data;
      const destination = getPostJoinDestination(res.data);
      if (!auto_approved) {
        showSuccess(
          translate(
            "Your request to join {organization} is pending review. You'll be notified once it's approved.",
            { organization: scope_name },
          ),
          translate('Request submitted'),
        );
        routerInstance.stateService.go(destination.state, destination.params);
        return;
      }
      await UsersService.refreshCurrentUser();
      if (project_uuid) {
        showSuccess(
          project_created
            ? translate('Project created in {organization}.', {
                organization: scope_name,
              })
            : translate(
                'You have joined an existing project in {organization}.',
                {
                  organization: scope_name,
                },
              ),
        );
      } else {
        showSuccess(
          translate('You have successfully joined {organization}', {
            organization: scope_name,
          }),
        );
      }
      routerInstance.stateService.go(destination.state, destination.params);
    },
    onError: async (error) => {
      // Clear the stored token here too — every error branch below navigates
      // into the app, where a stale token would re-open the flow on mount.
      GroupInvitationTokenStorage.remove();
      const errorMessage = format(error);
      if (isDuplicateOrConflictError(errorMessage)) {
        try {
          const dialog = getDuplicateErrorDialogOptions();
          await confirm(dialog.title, dialog.message, dialog.options);
        } finally {
          routerInstance.stateService.go('profile.details');
        }
      } else {
        try {
          await confirm(
            translate('Access restricted'),
            translateBackendError(errorMessage) ||
              translate(
                "You don't have the required permissions to join this organization.",
              ),
            {
              type: 'danger',
              size: 'sm',
              positiveButton: translate('Back to profile'),
              positiveButtonVariant: 'primary w-175px',
              onlyPositiveButton: true,
            },
          );
        } finally {
          // Access-restricted errors do not create a permission request,
          // so /profile/permission-requests/ would be misleading.
          routerInstance.stateService.go('profile.details');
        }
      }
    },
  });

  const collectProjectDetails = useCallback(
    (invitationToken: string): Promise<ProjectDetailsResult> => {
      return userGroupInvitationsRetrieve({
        path: { uuid: invitationToken },
      }).then((res) => {
        const invitation = res.data;
        if (!invitation.allow_custom_project_details) {
          return { cancelled: false };
        }
        const defaultProjectName = invitation.project_name_template
          ? resolveProjectNameTemplate(invitation.project_name_template, user)
          : '';
        return new Promise((resolve) => {
          openDialog(ProjectDetailsDialog, {
            resolve: {
              onSubmit: (data) => resolve({ cancelled: false, details: data }),
              onCancel: () => resolve({ cancelled: true }),
              defaultProjectName,
            },
            size: 'md',
          });
        });
      });
    },
    [openDialog, user],
  );

  const abortFlow = useCallback(() => {
    GroupInvitationTokenStorage.remove();
    routerInstance.stateService.go('profile.details');
  }, [routerInstance]);

  const submit = useCallback(() => {
    openDialog(GroupInvitationConfirmDialog, {
      resolve: {
        token,
        onConfirm: async () => {
          const result: ProjectDetailsResult = await collectProjectDetails(
            token,
          ).catch(() => {
            // The invitation vanished between the confirm dialog and here
            // (deleted or expired) — bail out instead of leaving the user
            // stranded with the token still stored.
            showError(translate('This invitation is no longer available.'));
            return { cancelled: true };
          });
          if (result.cancelled) {
            abortFlow();
          } else {
            submitMutation.mutate(result.details);
          }
        },
        onCancel: abortFlow,
      },
      backdrop: 'static',
    });
  }, [
    token,
    openDialog,
    collectProjectDetails,
    submitMutation,
    abortFlow,
    showError,
  ]);

  return { submit, isPending: submitMutation.isPending };
}
