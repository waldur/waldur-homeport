import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { useCallback } from 'react';
import {
  GroupInvitation,
  userGroupInvitationsRetrieve,
  userGroupInvitationsSubmitRequest,
} from 'waldur-js-client';

import { format } from '@/core/ErrorMessageFormatter';
import { GroupInvitationTokenStorage } from '@/core/StorageManager';
import { FieldErrorMessage } from '@/form/FieldError';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { renderFieldOrDash } from '@/table/utils';
import { UsersService } from '@/user/UsersService';

import {
  getDuplicateErrorDialogOptions,
  getPostJoinDestination,
  isDuplicateOrConflictError,
} from '../utils';

import { ProjectDetailsDialog } from './ProjectDetailsDialog';

/**
 * All callbacks resolve with a boolean: true when the request was submitted
 * and the user was navigated to the resulting destination, false when the
 * flow was cancelled or failed. Callers with their own post-login navigation
 * (e.g. AuthLoginCompleted) use it to avoid clobbering that destination.
 */
export const useRequestToAccessOrganization = () => {
  const { openDialog, confirm } = useModal();
  const router = useRouter();

  const submitRequest = useCallback(
    async (
      groupInvitationUuid: string,
      body?: { project_name?: string; project_description?: string },
    ): Promise<boolean> => {
      try {
        const res = await userGroupInvitationsSubmitRequest({
          path: { uuid: groupInvitationUuid },
          body: body || {},
        });
        const groupInvitation = res.data;
        GroupInvitationTokenStorage.remove();

        if (groupInvitation.auto_approved) {
          await UsersService.refreshCurrentUser();
          await confirm(
            translate('You have successfully joined {organization}', {
              organization: renderFieldOrDash(groupInvitation.scope_name),
            }),
            translate(
              'You can now see the shared resources and collaborate with your team.',
            ),
            {
              type: 'success',
              size: 'sm',
              positiveButton: translate('OK'),
              onlyPositiveButton: true,
              positiveButtonVariant: 'primary w-95px',
              iconNode: <CheckCircleIcon weight="bold" />,
            },
          );
        } else {
          await confirm(
            translate('Request has been sent for approval'),
            translate(
              "Your request to join the organization {name} has been submitted. You'll receive a notification once it's reviewed and approved.",
              {
                name: (
                  <strong>
                    {renderFieldOrDash(groupInvitation.scope_name)}
                  </strong>
                ),
              },
              formatJsxTemplate,
            ),
            {
              type: 'success',
              size: 'sm',
              positiveButton: translate('OK'),
              onlyPositiveButton: true,
              positiveButtonVariant: 'primary w-95px',
              iconNode: <CheckCircleIcon weight="bold" />,
            },
          );
        }
        // Leave for the request's destination so the user doesn't linger on
        // whatever page happened to trigger the flow (e.g. the invitation
        // route, where a reload would restart the whole dialog).
        const destination = getPostJoinDestination(groupInvitation);
        router.stateService.go(destination.state, destination.params);
        return true;
      } catch (err) {
        GroupInvitationTokenStorage.remove();
        const errorMessage = format(err);
        if (isDuplicateOrConflictError(errorMessage)) {
          const dialog = getDuplicateErrorDialogOptions();
          await confirm(dialog.title, dialog.message, dialog.options);
        } else {
          const formattedMessage = (
            <div>
              <p>
                {translate(
                  "You can't join this organization with your current account details. Access is limited to certain users as defined by the organization manager.",
                )}
              </p>
              <p className="fw-bolder">{translate('Restriction details')}:</p>
              <FieldErrorMessage error={errorMessage} />
            </div>
          );

          await confirm(translate('Access restricted'), formattedMessage, {
            type: 'danger',
            size: 'sm',
            positiveButton: translate('Cancel request'),
            onlyPositiveButton: true,
            positiveButtonVariant: 'danger',
            iconNode: <XCircleIcon weight="bold" />,
          });
        }
        return false;
      }
    },
    [confirm, router],
  );

  const request = useCallback(
    async (invitationOrUuid: GroupInvitation | string): Promise<boolean> => {
      let invitation: GroupInvitation;
      if (typeof invitationOrUuid === 'string') {
        try {
          const res = await userGroupInvitationsRetrieve({
            path: { uuid: invitationOrUuid },
          });
          invitation = res.data;
        } catch {
          // The stored token points to a deleted or expired invitation.
          // Drop it so it can't wedge every subsequent login.
          GroupInvitationTokenStorage.remove();
          return false;
        }
      } else {
        invitation = invitationOrUuid;
      }

      if (invitation.allow_custom_project_details) {
        return new Promise<boolean>((resolve) => {
          openDialog(ProjectDetailsDialog, {
            resolve: {
              onSubmit: (data) => {
                submitRequest(invitation.uuid, data).then(resolve);
              },
              onCancel: () => {
                GroupInvitationTokenStorage.remove();
                resolve(false);
              },
            },
            size: 'md',
          });
        });
      }
      return submitRequest(invitation.uuid);
    },
    [openDialog, submitRequest],
  );

  const checkAndRequest = useCallback(async (): Promise<boolean> => {
    const groupToken = GroupInvitationTokenStorage.get();
    if (groupToken) {
      const user = await UsersService.getCurrentUser();
      const hasAcceptedTos =
        user?.is_staff || user?.is_support || Boolean(user?.agreement_date);

      if (hasAcceptedTos) {
        return request(groupToken);
      }
    }
    return false;
  }, [request]);

  return { request, checkAndRequest };
};
