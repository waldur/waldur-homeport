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
  const { showSuccess } = useNotify();
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
      if (res.data.auto_approved) {
        await UsersService.refreshCurrentUser();
        showSuccess(
          translate('You have successfully joined {organization}', {
            organization: res.data.scope_name,
          }),
        );
      } else {
        showSuccess(
          translate(
            "Request has been sent. You'll be notified once it's approved.",
          ),
          translate('You are requested to join {organization}', {
            organization: res.data.scope_name,
          }),
        );
      }
      routerInstance.stateService.go('profile.details');
    },
    onError: async (error) => {
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
              positiveButton: translate('My requests'),
              positiveButtonVariant: 'primary w-175px',
              onlyPositiveButton: true,
            },
          );
        } finally {
          routerInstance.stateService.go('profile.permission-requests');
        }
      }
    },
  });

  const collectProjectDetails = useCallback(
    (
      invitationToken: string,
    ): Promise<{
      project_name?: string;
      project_description?: string;
    } | null> => {
      return userGroupInvitationsRetrieve({
        path: { uuid: invitationToken },
      }).then((res) => {
        const invitation = res.data;
        if (!invitation.allow_custom_project_details) return null;
        const defaultProjectName = invitation.project_name_template
          ? resolveProjectNameTemplate(invitation.project_name_template, user)
          : '';
        return new Promise((resolve) => {
          openDialog(ProjectDetailsDialog, {
            resolve: {
              onSubmit: (data) => resolve(data),
              onCancel: () => resolve(null),
              defaultProjectName,
            },
            size: 'md',
          });
        });
      });
    },
    [openDialog, user],
  );

  const submit = useCallback(() => {
    openDialog(GroupInvitationConfirmDialog, {
      resolve: {
        token,
        onConfirm: async () => {
          const projectDetails = await collectProjectDetails(token);
          submitMutation.mutate(projectDetails || undefined);
        },
        onCancel: () => {
          GroupInvitationTokenStorage.remove();
          routerInstance.stateService.go('profile.details');
        },
      },
      backdrop: 'static',
    });
  }, [
    token,
    openDialog,
    collectProjectDetails,
    submitMutation,
    routerInstance,
  ]);

  return { submit, isPending: submitMutation.isPending };
}
